import { describe, it, vi, expect, beforeAll, afterAll, Mock } from 'vitest';
import { DataSource, EntityManager } from 'typeorm';
import * as XLSX from 'xlsx';
import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import {
  DataManagementService,
  ExportError,
} from '@/services/DataManagementService';
import { initializeTestDatabase, cleanupTestData, seedTestData } from './setup';
import { Exam, Grade, School, Subject, Semester } from '@/db/entities';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn().mockReturnValue(false),
  },
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    writeFile: vi.fn(),
    stat: vi.fn(),
    getUri: vi.fn(),
  },
  Directory: {
    Documents: 'DOCUMENTS',
  },
}));

vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn(),
  },
}));

global.URL.createObjectURL = vi.fn(() => 'blob:mocked-url');
global.URL.revokeObjectURL = vi.fn();

describe('DataManagementService', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await initializeTestDatabase();

    const dataSourceModule = await import('@/db/data-source');
    vi.spyOn(dataSourceModule, 'getDataSource').mockReturnValue(dataSource);
    vi.spyOn(dataSourceModule, 'getRepositories').mockReturnValue({
      school: dataSource.getRepository(School),
      subject: dataSource.getRepository(Subject),
      exam: dataSource.getRepository(Exam),
      grade: dataSource.getRepository(Grade),
      semester: dataSource.getRepository(Semester),
    });

    await seedTestData(dataSource);
  });

  afterAll(async () => {
    await cleanupTestData(dataSource);
    vi.clearAllMocks();
  });

  it('should delete all data from all tables', async () => {
    const schoolRepo = dataSource.getRepository(School);
    const subjectRepo = dataSource.getRepository(Subject);
    const examRepo = dataSource.getRepository(Exam);
    const gradeRepo = dataSource.getRepository(Grade);
    const semesterRepo = dataSource.getRepository(Semester);

    expect(await schoolRepo.count()).toBeGreaterThan(0);
    expect(await subjectRepo.count()).toBeGreaterThan(0);
    expect(await examRepo.count()).toBeGreaterThan(0);
    expect(await gradeRepo.count()).toBeGreaterThan(0);
    expect(await semesterRepo.count()).toBeGreaterThan(0);

    await DataManagementService.resetAllData();

    expect(await schoolRepo.count()).toBe(0);
    expect(await subjectRepo.count()).toBe(0);
    expect(await examRepo.count()).toBe(0);
    expect(await gradeRepo.count()).toBe(0);
    expect(await semesterRepo.count()).toBe(0);
  });

  it('should throw an error if data reset fails', async () => {
    const dataSourceModule = await import('@/db/data-source');
    vi.spyOn(dataSource, 'transaction').mockRejectedValueOnce(
      new Error('Database error'),
    );
    vi.spyOn(dataSourceModule, 'getDataSource').mockReturnValue(dataSource);

    await expect(DataManagementService.resetAllData()).rejects.toThrow();
  });

  describe('exportData', () => {
    beforeAll(async () => {
      await seedTestData(dataSource);
    });

    it('should throw error for invalid school', async () => {
      await expect(
        DataManagementService.exportData({
          format: 'xlsx',
          filename: 'export.xlsx',
          schoolId: 'invalid-id',
        }),
      ).rejects.toThrow(ExportError);
    });

    it('should throw INVALID_DATA error if no schools found when exporting all', async () => {
      const schoolRepo = dataSource.getRepository(School);
      const findSpy = vi.spyOn(schoolRepo, 'find').mockResolvedValue([]);

      await expect(
        DataManagementService.exportData({
          format: 'xlsx',
          filename: 'export_all.xlsx',
          schoolId: 'all',
        }),
      ).rejects.toThrow(ExportError);

      try {
        await DataManagementService.exportData({
          format: 'xlsx',
          filename: 'export_all.xlsx',
          schoolId: 'all',
        });
      } catch (error) {
        if (error instanceof ExportError) {
          expect(error.message).toBe('Keine Schulen gefunden.');
          expect(error.code).toBe('INVALID_DATA');
        }
      }

      findSpy.mockRestore();
    });

    it('should use native export functionality on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: 'file://path/to/export.xlsx',
      });

      const schoolRepo = dataSource.getRepository(School);
      const school = await schoolRepo.findOne({ where: {} });

      const result = await DataManagementService.exportData({
        format: 'xlsx',
        filename: 'export_native.xlsx',
        schoolId: school!.id,
      });

      expect(Filesystem.writeFile).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'export_native.xlsx',
          directory: 'DOCUMENTS',
        }),
      );
      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'file://path/to/export.xlsx',
        }),
      );
      expect(result.success).toBe(true);

      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    });

    it('should handle cancelled share correctly on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: 'file://path/to/export.xlsx',
      });
      vi.mocked(Share.share).mockRejectedValueOnce(
        new Error('Share cancelled by user'),
      );

      const schoolRepo = dataSource.getRepository(School);
      const school = await schoolRepo.findOne({ where: {} });

      const result = await DataManagementService.exportData({
        format: 'xlsx',
        filename: 'export_native_cancelled.xlsx',
        schoolId: school!.id,
      });

      expect(result).toEqual({
        success: true,
        message: 'Vorgang abgebrochen. Datei wurde gespeichert.',
        filename: 'export_native_cancelled.xlsx',
      });

      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    });

    it.each([
      {
        desc: 'should throw ExportError when share fails (not cancelled) on native platform',
        mockShare: () =>
          vi
            .mocked(Share.share)
            .mockRejectedValueOnce(new Error('Sharing failed')),
        mockFs: () => {},
        expectedCode: 'SAVE_FAILED',
        expectedMsg: 'Datei wurde gespeichert, Teilen war nicht möglich.',
      },
      {
        desc: 'should throw ExportError when file write fails on native platform',
        mockShare: () => {},
        mockFs: () =>
          vi
            .mocked(Filesystem.writeFile)
            .mockRejectedValueOnce(new Error('permission denied')),
        expectedCode: 'SAVE_FAILED',
        expectedMsg: 'Keine Berechtigung zum Speichern von Dateien.',
      },
    ])('$desc', async ({ mockShare, mockFs, expectedCode, expectedMsg }) => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: 'file://path/to/export.xlsx',
      });
      mockShare();
      mockFs();

      const schoolRepo = dataSource.getRepository(School);
      const school = await schoolRepo.findOne({ where: {} });

      await expect(
        DataManagementService.exportData({
          format: 'xlsx',
          filename: 'error_test.xlsx',
          schoolId: school!.id,
        }),
      ).rejects.toThrow(ExportError);

      try {
        await DataManagementService.exportData({
          format: 'xlsx',
          filename: 'error_test.xlsx',
          schoolId: school!.id,
        });
      } catch (error) {
        if (error instanceof ExportError) {
          expect(error.code).toBe(expectedCode);
          expect(error.message).toBe(expectedMsg);
        }
      }

      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    });

    it('should format XLSX correctly for multiple schools including overview and summaries', async () => {
      const schoolRepo = dataSource.getRepository(School);
      const uniqueSchool = schoolRepo.create({
        name: 'Unique Test School',
        type: 'University',
        address: '789 Test Blvd',
      });
      await schoolRepo.save(uniqueSchool);

      const semesterRepo = dataSource.getRepository(Semester);
      const semester = await semesterRepo.save(
        semesterRepo.create({
          name: 'Unique Semester',
          startDate: new Date(),
          endDate: new Date(),
          school: uniqueSchool,
        }),
      );

      const subjectRepo = dataSource.getRepository(Subject);
      const subject = subjectRepo.create({
        name: 'Unique Subject',
        weight: 1,
        semester: semester,
      });
      await subjectRepo.save(subject);

      const examRepo = dataSource.getRepository(Exam);
      const exam = examRepo.create({
        name: 'Unique Exam',
        subject: subject,
        date: new Date(),
        isCompleted: true,
        weight: 1,
      });
      await examRepo.save(exam);

      const gradeRepo = dataSource.getRepository(Grade);
      const grade = gradeRepo.create({
        exam: exam,
        score: 5.5,
        weight: 1,
        date: new Date(),
      });
      await gradeRepo.save(grade);

      const appendSheetSpy = vi.spyOn(XLSX.utils, 'book_append_sheet');

      const result = await DataManagementService.exportData({
        format: 'xlsx',
        filename: 'export_full_check.xlsx',
        schoolId: 'all',
      });

      expect(result.success).toBe(true);

      expect(appendSheetSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'Übersicht',
      );
      expect(appendSheetSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'Alle Schulen',
      );
      expect(appendSheetSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'Alle Fächer',
      );
      expect(appendSheetSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'Alle Prüfungen',
      );
      expect(appendSheetSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'Zusammenfassung',
      );
      expect(appendSheetSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'Unique Test School',
      );

      appendSheetSpy.mockRestore();
    });

    it('should populate "Alle Fächer" sheet with correct subject data including weight fallback and formatted createdAt', async () => {
      const schoolRepo = dataSource.getRepository(School);
      const semesterRepo = dataSource.getRepository(Semester);
      const subjectRepo = dataSource.getRepository(Subject);

      const school = await schoolRepo.save(
        schoolRepo.create({ name: 'Fächer Sheet School' }),
      );
      const semester = await semesterRepo.save(
        semesterRepo.create({
          name: 'FS Semester',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-06-30'),
          school,
        }),
      );
      await subjectRepo.save(
        subjectRepo.create({
          name: 'Subject Without Weight',
          teacher: 'Herr Müller',
          weight: 0,
          semesterId: semester.id,
        }),
      );
      await subjectRepo.save(
        subjectRepo.create({
          name: 'Subject With Weight',
          teacher: null,
          weight: 3,
          semesterId: semester.id,
        }),
      );

      const school2 = await schoolRepo.save(
        schoolRepo.create({ name: 'Fächer Sheet School 2' }),
      );
      await semesterRepo.save(
        semesterRepo.create({
          name: 'FS Semester 2',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-06-30'),
          school: school2,
        }),
      );

      const aoaSpy = vi.spyOn(XLSX.utils, 'aoa_to_sheet');

      await DataManagementService.exportData({
        format: 'xlsx',
        filename: 'faecher_test.xlsx',
        schoolId: 'all',
      });

      const faecherCall = aoaSpy.mock.calls.find((call) => {
        const data = call[0] as unknown[][];
        return (
          data &&
          data[0] &&
          data[0][0] === 'Schule' &&
          data[0][1] === 'Semester' &&
          data[0][2] === 'Fach' &&
          data[0][3] === 'Lehrer' &&
          data[0][4] === 'Gewichtung' &&
          data[0][5] === 'Erstellt am'
        );
      });

      expect(faecherCall).toBeDefined();
      const faecherData = faecherCall![0] as unknown[][];

      const noWeightRow = faecherData.find(
        (row) => row[2] === 'Subject Without Weight',
      );
      const withWeightRow = faecherData.find(
        (row) => row[2] === 'Subject With Weight',
      );

      expect(noWeightRow).toBeDefined();
      expect(withWeightRow).toBeDefined();

      expect(noWeightRow![4]).toBe(1);
      expect(withWeightRow![4]).toBe(3);
      expect(withWeightRow![3]).toBe('');
      expect(noWeightRow![3]).toBe('Herr Müller');
      expect(typeof noWeightRow![5]).toBe('string');
      expect(noWeightRow![5]).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/);
      expect(noWeightRow![0]).toBe('Fächer Sheet School');
      expect(noWeightRow![1]).toBe('FS Semester');

      aoaSpy.mockRestore();
    });

    it('should populate "Alle Prüfungen" sheet with correct exam data including date, weight fallback, and grade fields', async () => {
      const schoolRepo = dataSource.getRepository(School);
      const semesterRepo = dataSource.getRepository(Semester);
      const subjectRepo = dataSource.getRepository(Subject);
      const examRepo = dataSource.getRepository(Exam);
      const gradeRepo = dataSource.getRepository(Grade);

      const school = await schoolRepo.save(
        schoolRepo.create({ name: 'Prüfungen Sheet School' }),
      );
      const semester = await semesterRepo.save(
        semesterRepo.create({
          name: 'PS Semester',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-06-30'),
          school,
        }),
      );
      const subject = await subjectRepo.save(
        subjectRepo.create({
          name: 'PS Subject',
          weight: 2,
          semesterId: semester.id,
        }),
      );
      const examWithGrade = await examRepo.save(
        examRepo.create({
          name: 'Graded Exam',
          date: new Date('2025-03-15'),
          weight: 2,
          isCompleted: true,
          subject,
        }),
      );
      await gradeRepo.save(
        gradeRepo.create({
          exam: examWithGrade,
          score: 4.5,
          weight: 1.5,
          comment: 'Gut gemacht',
          date: new Date(),
        }),
      );
      await examRepo.save(
        examRepo.create({
          name: 'Ungraded Exam',
          date: new Date('2025-06-20'),
          weight: 0,
          isCompleted: false,
          subject,
        }),
      );

      const school2 = await schoolRepo.save(
        schoolRepo.create({ name: 'Prüfungen Sheet School 2' }),
      );
      await semesterRepo.save(
        semesterRepo.create({
          name: 'PS Semester 2',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-06-30'),
          school: school2,
        }),
      );

      const aoaSpy = vi.spyOn(XLSX.utils, 'aoa_to_sheet');

      await DataManagementService.exportData({
        format: 'xlsx',
        filename: 'pruefungen_test.xlsx',
        schoolId: 'all',
      });

      const pruefungenCall = aoaSpy.mock.calls.find((call) => {
        const data = call[0] as unknown[][];
        return (
          data &&
          data[0] &&
          data[0][0] === 'Schule' &&
          data[0][3] === 'Prüfung' &&
          data[0][4] === 'Datum' &&
          data[0][7] === 'Note'
        );
      });

      expect(pruefungenCall).toBeDefined();
      const pruefungenData = pruefungenCall![0] as unknown[][];

      const gradedRow = pruefungenData.find((row) => row[3] === 'Graded Exam');
      const ungradedRow = pruefungenData.find(
        (row) => row[3] === 'Ungraded Exam',
      );

      expect(gradedRow).toBeDefined();
      expect(ungradedRow).toBeDefined();

      expect(gradedRow![0]).toBe('Prüfungen Sheet School');
      expect(gradedRow![1]).toBe('PS Semester');
      expect(gradedRow![2]).toBe('PS Subject');
      expect(gradedRow![4]).toBe('2025-03-15');
      expect(ungradedRow![4]).toBe('2025-06-20');
      expect(gradedRow![5]).toBe(2);
      expect(ungradedRow![5]).toBe(1);
      expect(gradedRow![6]).toBe('Ja');
      expect(ungradedRow![6]).toBe('Nein');
      expect(gradedRow![7]).toBe(4.5);
      expect(gradedRow![8]).toBe(1.5);
      expect(gradedRow![9]).toBe('Gut gemacht');
      expect(ungradedRow![7]).toBe('');
      expect(ungradedRow![8]).toBe('');
      expect(ungradedRow![9]).toBe('');

      aoaSpy.mockRestore();
    });

    it('should throw SAVE_FAILED error when web export fails', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);

      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation(() => {
          throw new Error('DOM Error');
        });

      const schoolRepo = dataSource.getRepository(School);
      const school = await schoolRepo.findOne({ where: {} });

      await expect(
        DataManagementService.exportData({
          format: 'xlsx',
          filename: 'fail.xlsx',
          schoolId: school!.id,
        }),
      ).rejects.toThrow(ExportError);

      try {
        await DataManagementService.exportData({
          format: 'xlsx',
          filename: 'fail.xlsx',
          schoolId: school!.id,
        });
      } catch (error) {
        if (error instanceof ExportError) {
          expect(error.code).toBe('SAVE_FAILED');
          expect(error.message).toBe('Download fehlgeschlagen.');
        }
      }

      createElementSpy.mockRestore();
    });

    it('should handle non-Error object in isShareCancelled correctly', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Filesystem.getUri).mockResolvedValue({ uri: 'file://test' });
      vi.mocked(Share.share).mockRejectedValueOnce('Just a string error');

      const schoolRepo = dataSource.getRepository(School);
      const school = await schoolRepo.findOne({ where: {} });

      await expect(
        DataManagementService.exportData({
          format: 'xlsx',
          filename: 'test.xlsx',
          schoolId: school!.id,
        }),
      ).rejects.toThrow(ExportError);

      try {
        await DataManagementService.exportData({
          format: 'xlsx',
          filename: 'test.xlsx',
          schoolId: school!.id,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ExportError);
        if (error instanceof ExportError) {
          expect(error.message).toBe('Unbekannter Fehler beim Export.');
        }
      }

      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    });

    it('should correctly format subject averages in single school export', async () => {
      const schoolRepo = dataSource.getRepository(School);
      const school = schoolRepo.create({ name: 'Avg Test School' });
      await schoolRepo.save(school);

      const semesterRepo = dataSource.getRepository(Semester);
      const semester =
        (await semesterRepo.findOne({ where: { schoolId: school.id } })) ??
        (await semesterRepo.save(
          semesterRepo.create({
            name: '2025/2026',
            startDate: new Date('2025-08-15'),
            endDate: new Date('2026-07-31'),
            schoolId: school.id,
          }),
        ));

      const subjectRepo = dataSource.getRepository(Subject);
      const subject = subjectRepo.create({
        name: 'Avg Test Subject',
        semesterId: semester.id,
      });
      await subjectRepo.save(subject);

      const examRepo = dataSource.getRepository(Exam);
      const exam = examRepo.create({
        name: 'Exam 1',
        subject,
        isCompleted: true,
        weight: 1,
        date: new Date(),
      });
      await examRepo.save(exam);

      const gradeRepo = dataSource.getRepository(Grade);
      gradeRepo.create({ exam, score: 2.5, weight: 1, date: new Date() });
      await gradeRepo.save(
        gradeRepo.create({ exam, score: 2.5, weight: 1, date: new Date() }),
      );

      const aoaSpy = vi.spyOn(XLSX.utils, 'aoa_to_sheet');

      await DataManagementService.exportData({
        format: 'xlsx',
        filename: 'single_school.xlsx',
        schoolId: school.id,
      });

      const summariesCall = aoaSpy.mock.calls.find((call) => {
        const data = call[0] as unknown[][];
        return data && data[0] && data[0][0] === 'Summaries';
      });

      expect(summariesCall).toBeDefined();
      const summariesData = summariesCall![0] as unknown[][];

      const subjectRow = summariesData.find(
        (row) => row[0] === 'Avg Test Subject',
      );
      expect(subjectRow).toBeDefined();
      expect(subjectRow![1]).toBe('2.50');

      aoaSpy.mockRestore();
    });

    it('should populate "Subjects" sheet with correct data including weight fallback and createdAt in single school export', async () => {
      const schoolRepo = dataSource.getRepository(School);
      const semesterRepo = dataSource.getRepository(Semester);
      const subjectRepo = dataSource.getRepository(Subject);

      const school = await schoolRepo.save(
        schoolRepo.create({ name: 'Single Subjects School' }),
      );
      const semester = await semesterRepo.save(
        semesterRepo.create({
          name: 'SS Semester',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-06-30'),
          school,
        }),
      );
      await subjectRepo.save(
        subjectRepo.create({
          name: 'Zero Weight Subject',
          teacher: 'Frau Schmidt',
          weight: 0,
          semesterId: semester.id,
        }),
      );
      await subjectRepo.save(
        subjectRepo.create({
          name: 'Normal Weight Subject',
          teacher: null,
          weight: 4,
          semesterId: semester.id,
        }),
      );

      const aoaSpy = vi.spyOn(XLSX.utils, 'aoa_to_sheet');

      await DataManagementService.exportData({
        format: 'xlsx',
        filename: 'single_subjects.xlsx',
        schoolId: school.id,
      });

      const subjectsCall = aoaSpy.mock.calls.find((call) => {
        const data = call[0] as unknown[][];
        return (
          data &&
          data[0] &&
          data[0][0] === 'Semester' &&
          data[0][1] === 'Name' &&
          data[0][2] === 'Teacher' &&
          data[0][3] === 'Weight' &&
          data[0][4] === 'Created at'
        );
      });

      expect(subjectsCall).toBeDefined();
      const subjectsData = subjectsCall![0] as unknown[][];

      const zeroWeightRow = subjectsData.find(
        (row) => row[1] === 'Zero Weight Subject',
      );
      const normalWeightRow = subjectsData.find(
        (row) => row[1] === 'Normal Weight Subject',
      );

      expect(zeroWeightRow).toBeDefined();
      expect(normalWeightRow).toBeDefined();

      expect(zeroWeightRow![3]).toBe(1);
      expect(normalWeightRow![3]).toBe(4);
      expect(zeroWeightRow![2]).toBe('Frau Schmidt');
      expect(normalWeightRow![2]).toBe('');
      expect(zeroWeightRow![0]).toBe('SS Semester');
      expect(typeof zeroWeightRow![4]).toBe('string');
      expect(zeroWeightRow![4]).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/);

      aoaSpy.mockRestore();
    });

    it('should populate "Exams" sheet with correct data including date, weight fallback, completed flag, and grade fields in single school export', async () => {
      const schoolRepo = dataSource.getRepository(School);
      const semesterRepo = dataSource.getRepository(Semester);
      const subjectRepo = dataSource.getRepository(Subject);
      const examRepo = dataSource.getRepository(Exam);
      const gradeRepo = dataSource.getRepository(Grade);

      const school = await schoolRepo.save(
        schoolRepo.create({ name: 'Single Exams School' }),
      );
      const semester = await semesterRepo.save(
        semesterRepo.create({
          name: 'SE Semester',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-06-30'),
          school,
        }),
      );
      const subject = await subjectRepo.save(
        subjectRepo.create({
          name: 'SE Subject',
          weight: 1,
          semesterId: semester.id,
        }),
      );
      const completedExam = await examRepo.save(
        examRepo.create({
          name: 'Completed Exam',
          date: new Date('2025-04-10'),
          weight: 3,
          isCompleted: true,
          subject,
        }),
      );
      await gradeRepo.save(
        gradeRepo.create({
          exam: completedExam,
          score: 5.0,
          weight: 1,
          comment: 'Sehr gut',
          date: new Date(),
        }),
      );
      await examRepo.save(
        examRepo.create({
          name: 'Incomplete Exam',
          date: new Date('2025-09-01'),
          weight: 0,
          isCompleted: false,
          subject,
        }),
      );

      const aoaSpy = vi.spyOn(XLSX.utils, 'aoa_to_sheet');

      await DataManagementService.exportData({
        format: 'xlsx',
        filename: 'single_exams.xlsx',
        schoolId: school.id,
      });

      const examsCall = aoaSpy.mock.calls.find((call) => {
        const data = call[0] as unknown[][];
        return (
          data &&
          data[0] &&
          data[0][0] === 'Semester' &&
          data[0][1] === 'Subject' &&
          data[0][2] === 'Name' &&
          data[0][3] === 'Date' &&
          data[0][4] === 'Weight' &&
          data[0][5] === 'Completed' &&
          data[0][6] === 'Score' &&
          data[0][7] === 'Comment'
        );
      });

      expect(examsCall).toBeDefined();
      const examsData = examsCall![0] as unknown[][];

      const completedRow = examsData.find((row) => row[2] === 'Completed Exam');
      const incompleteRow = examsData.find(
        (row) => row[2] === 'Incomplete Exam',
      );

      expect(completedRow).toBeDefined();
      expect(incompleteRow).toBeDefined();

      expect(completedRow![0]).toBe('SE Semester');
      expect(completedRow![1]).toBe('SE Subject');
      expect(completedRow![3]).toBe('2025-04-10');
      expect(incompleteRow![3]).toBe('2025-09-01');
      expect(completedRow![4]).toBe(3);
      expect(incompleteRow![4]).toBe(1);
      expect(completedRow![5]).toBe('Yes');
      expect(incompleteRow![5]).toBe('No');
      expect(completedRow![6]).toBe(5.0);
      expect(incompleteRow![6]).toBe('');
      expect(completedRow![7]).toBe('Sehr gut');
      expect(incompleteRow![7]).toBe('');

      aoaSpy.mockRestore();
    });

    it('should wrap non-ExportError into ExportError with UNKNOWN code', async () => {
      const bookNewSpy = vi
        .spyOn(XLSX.utils, 'book_new')
        .mockImplementation(() => {
          throw new Error('unexpected internal error');
        });

      const schoolRepo = dataSource.getRepository(School);
      const school = await schoolRepo.findOne({ where: {} });

      try {
        await DataManagementService.exportData({
          format: 'xlsx',
          filename: 'unknown_error.xlsx',
          schoolId: school!.id,
        });
        expect.unreachable('should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ExportError);
        if (error instanceof ExportError) {
          expect(error.code).toBe('UNKNOWN');
          expect(error.message).toBe(
            'Export fehlgeschlagen. Bitte versuchen Sie es erneut.',
          );
        }
      }

      bookNewSpy.mockRestore();
    });
  });

  describe('exportAsJSON', () => {
    it('should export data as JSON on web', async () => {
      const result = await DataManagementService.exportAsJSON();

      expect(result).toEqual({
        success: true,
        message: 'Backup erfolgreich heruntergeladen.',
        filename: expect.stringMatching(/netgrade_backup_.*\.json/),
      });
    });

    it('should throw error if no data to export', async () => {
      const schoolRepo = dataSource.getRepository(School);
      const findSpy = vi.spyOn(schoolRepo, 'find').mockResolvedValue([]);

      await expect(DataManagementService.exportAsJSON()).rejects.toThrow(
        ExportError,
      );

      findSpy.mockRestore();
    });

    it('should serialize Date objects as YYYY-MM-DD strings in JSON output', async () => {
      const originalToJSON = Date.prototype.toJSON;
      Object.defineProperty(Date.prototype, 'toJSON', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      const testDate = new Date('2025-06-15T14:30:00.000Z');

      const schoolRepo = dataSource.getRepository(School);
      const mockSchool = {
        id: 'date-test-id',
        name: 'Date Test School',
        semesters: [
          {
            startDate: testDate,
            endDate: testDate,
            subjects: [],
          },
        ],
      } as unknown as School;

      const findSpy = vi
        .spyOn(schoolRepo, 'find')
        .mockResolvedValue([mockSchool]);

      const createElementSpy = vi.spyOn(document, 'createElement');
      const anchorClickSpy = vi.fn();

      createElementSpy.mockImplementationOnce((tag: string) => {
        const element = document.createElement(tag);
        vi.spyOn(element, 'click').mockImplementation(anchorClickSpy);
        return element;
      });

      (global.URL.createObjectURL as Mock).mockClear();

      await DataManagementService.exportAsJSON();

      Date.prototype.toJSON = originalToJSON;

      expect(anchorClickSpy).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      const blob = (global.URL.createObjectURL as Mock).mock
        .calls[0][0] as Blob;
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(blob);
      });
      const parsed = JSON.parse(text);

      expect(parsed.schools[0].semesters[0].startDate).toBe('2025-06-15');
      expect(parsed.schools[0].semesters[0].endDate).toBe('2025-06-15');

      findSpy.mockRestore();
      createElementSpy.mockRestore();
    });

    it('should use native export functionality for JSON on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: 'file://path/to/backup.json',
      });

      const result = await DataManagementService.exportAsJSON();

      expect(Filesystem.writeFile).toHaveBeenCalledWith(
        expect.objectContaining({
          path: expect.stringMatching(/netgrade_backup_.*\.json/),
          directory: 'DOCUMENTS',
        }),
      );
      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'file://path/to/backup.json',
        }),
      );
      expect(result.success).toBe(true);

      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    });

    it('should handle cancelled share correctly on native platform (JSON)', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: 'file://path/to/backup.json',
      });
      vi.mocked(Share.share).mockRejectedValueOnce(
        new Error('Share cancelled by user'),
      );

      const result = await DataManagementService.exportAsJSON();

      expect(result).toEqual({
        success: true,
        message: 'Vorgang abgebrochen. Backup wurde gespeichert.',
        filename: expect.stringMatching(/netgrade_backup_.*\.json/),
      });

      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    });

    it.each([
      {
        desc: 'should throw ExportError when share fails (not cancelled) on native platform (JSON)',
        mockShare: () =>
          vi
            .mocked(Share.share)
            .mockRejectedValueOnce(new Error('Sharing failed')),
        mockFs: () => {},
        expectedCode: 'SAVE_FAILED',
        expectedMsg: 'Datei wurde gespeichert, Teilen war nicht möglich.',
      },
      {
        desc: 'should throw ExportError when file write fails on native platform (JSON)',
        mockShare: () => {},
        mockFs: () =>
          vi
            .mocked(Filesystem.writeFile)
            .mockRejectedValueOnce(new Error('permission denied')),
        expectedCode: 'SAVE_FAILED',
        expectedMsg: 'Keine Berechtigung zum Speichern von Dateien.',
      },
    ])('$desc', async ({ mockShare, mockFs, expectedCode, expectedMsg }) => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: 'file://path/to/backup.json',
      });
      mockShare();
      mockFs();

      await expect(DataManagementService.exportAsJSON()).rejects.toThrow(
        ExportError,
      );

      try {
        await DataManagementService.exportAsJSON();
      } catch (error) {
        if (error instanceof ExportError) {
          expect(error.code).toBe(expectedCode);
          expect(error.message).toBe(expectedMsg);
        }
      }

      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    });

    it('should throw SAVE_FAILED error when web export JSON fails', async () => {
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation(() => {
          throw new Error('DOM Error JSON');
        });

      await expect(DataManagementService.exportAsJSON()).rejects.toThrow(
        ExportError,
      );

      try {
        await DataManagementService.exportAsJSON();
      } catch (error) {
        if (error instanceof ExportError) {
          expect(error.code).toBe('SAVE_FAILED');
          expect(error.message).toBe('Backup-Download fehlgeschlagen.');
        }
      }

      createElementSpy.mockRestore();
    });

    it('should throw UNKNOWN error when an update unexpected error occurs', async () => {
      const schoolRepo = dataSource.getRepository(School);
      const findSpy = vi
        .spyOn(schoolRepo, 'find')
        .mockRejectedValue(new Error('Unexpected DB Error'));

      await expect(DataManagementService.exportAsJSON()).rejects.toThrow(
        ExportError,
      );

      try {
        await DataManagementService.exportAsJSON();
      } catch (error) {
        expect(error).toBeInstanceOf(ExportError);
        if (error instanceof ExportError) {
          expect(error.code).toBe('UNKNOWN');
          expect(error.message).toBe(
            'Backup-Export fehlgeschlagen. Bitte versuchen Sie es erneut.',
          );
        }
      }

      findSpy.mockRestore();
    });
  });

  describe('importFromJSON', () => {
    it('should parse "date" fields as Date objects', async () => {
      const validJson = JSON.stringify({
        schools: [
          {
            name: 'Test School',
            subjects: [
              {
                name: 'Test Subject',
                exams: [
                  {
                    name: 'Test Exam',
                    date: '2023-12-24',
                    isCompleted: true,
                  },
                ],
              },
            ],
          },
        ],
      });

      const saveSpy = vi.fn();
      const querySpy = vi.fn();

      vi.spyOn(dataSource, 'transaction').mockImplementation(
        async (
          runInTransactionOrIsolationLevel:
            | ((entityManager: EntityManager) => Promise<unknown>)
            | string,
          maybeRunInTransaction?: (
            entityManager: EntityManager,
          ) => Promise<unknown>,
        ) => {
          const cb =
            typeof runInTransactionOrIsolationLevel === 'function'
              ? runInTransactionOrIsolationLevel
              : maybeRunInTransaction!;

          const mockManager = {
            query: querySpy,
            getRepository: () => ({ save: saveSpy }),
          } as unknown as EntityManager;
          return cb(mockManager);
        },
      );

      await DataManagementService.importFromJSON(validJson);

      const savedSchools = saveSpy.mock.calls[0][0];
      const examDate = savedSchools[0].subjects[0].exams[0].date;

      expect(examDate).toBeInstanceOf(Date);
      expect(examDate.toISOString().startsWith('2023-12-24')).toBe(true);
    });

    it('should successfully parse valid backup JSON and save to database', async () => {
      const validJson = JSON.stringify({
        schools: [{ name: 'Test School', subjects: [] }],
      });

      const saveSpy = vi.fn();
      const querySpy = vi.fn();

      vi.spyOn(dataSource, 'transaction').mockImplementation(
        async <T>(
          runInTransactionOrIsolationLevel:
            | ((entityManager: EntityManager) => Promise<T>)
            | string,
          maybeRunInTransaction?: (entityManager: EntityManager) => Promise<T>,
        ) => {
          const cb =
            typeof runInTransactionOrIsolationLevel === 'function'
              ? runInTransactionOrIsolationLevel
              : maybeRunInTransaction!;

          const mockManager = {
            query: querySpy,
            getRepository: () => ({ save: saveSpy }),
          } as unknown as EntityManager;
          return cb(mockManager);
        },
      );

      await DataManagementService.importFromJSON(validJson);

      expect(querySpy).toHaveBeenCalledWith('DELETE FROM grade');
      expect(querySpy).toHaveBeenCalledWith('DELETE FROM exam');
      expect(querySpy).toHaveBeenCalledWith('DELETE FROM subject');
      expect(querySpy).toHaveBeenCalledWith('DELETE FROM school');
      expect(saveSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Test School' }),
        ]),
      );
    });

    it.each([
      {
        desc: 'should throw PARSE_FAILED error for invalid JSON syntax',
        jsonInput: '{ invalid: json ',
        expectedCode: 'PARSE_FAILED',
        errorClass: SyntaxError,
      },
      {
        desc: 'should throw INVALID_DATA error if schools array is missing',
        jsonInput: JSON.stringify({ wrongKey: [] }),
        expectedCode: 'INVALID_DATA',
        errorClass: ExportError,
      },
    ])('$desc', async ({ jsonInput, expectedCode }) => {
      await expect(
        DataManagementService.importFromJSON(jsonInput),
      ).rejects.toThrow(ExportError);

      try {
        await DataManagementService.importFromJSON(jsonInput);
      } catch (error) {
        if (error instanceof ExportError) {
          expect(error.code).toBe(expectedCode);
        } else {
          throw error;
        }
      }
    });

    it('should throw UNKNOWN error if database transaction fails', async () => {
      const transactionSpy = vi
        .spyOn(dataSource, 'transaction')
        .mockRejectedValueOnce(new Error('DB Error'));

      const validJson = JSON.stringify({ schools: [] });

      await expect(
        DataManagementService.importFromJSON(validJson),
      ).rejects.toThrow(ExportError);

      try {
        await DataManagementService.importFromJSON(validJson);
      } catch (error) {
        expect(error).toBeInstanceOf(ExportError);
        if (error instanceof ExportError) {
          expect(error.code).toBe('UNKNOWN');
        }
      }

      transactionSpy.mockRestore();
    });
  });

  describe('formatData', () => {
    const formatData = (schools: School[], format: unknown) =>
      (
        DataManagementService as unknown as {
          formatData: (schools: School[], format: unknown) => string;
        }
      ).formatData(schools, format);

    it('should throw error for unsupported format', () => {
      expect(() => formatData([], 'csv')).toThrow('Unsupported format: csv');
    });
  });

  describe('createBlob', () => {
    const createBlob = (content: string, format: unknown) =>
      (
        DataManagementService as unknown as {
          createBlob: (content: string, format: unknown) => Blob;
        }
      ).createBlob(content, format);

    it('should return text/plain blob for unknown format', () => {
      const blob = createBlob('some content', 'unknown-format');
      expect(blob.type).toBe('text/plain');
    });
  });

  describe('getErrorMessage', () => {
    const getErrorMessage = (error: unknown) =>
      (
        DataManagementService as unknown as {
          getErrorMessage: (error: unknown) => string;
        }
      ).getErrorMessage(error);

    it.each([
      [
        new Error('Some file error occurred'),
        'Datei konnte nicht geöffnet werden. Versuchen Sie es erneut.',
      ],
      [
        new Error('File access denied'),
        'Datei konnte nicht geöffnet werden. Versuchen Sie es erneut.',
      ],
      [
        new Error('Write permission denied'),
        'Keine Berechtigung zum Speichern von Dateien.',
      ],
      [
        new Error('Share failed'),
        'Datei wurde gespeichert, Teilen war nicht möglich.',
      ],
      ['Unknown string error', 'Unbekannter Fehler beim Export.'],
      [{ code: 500 }, 'Unbekannter Fehler beim Export.'],
    ])('should return correct message for %s', (error, expected) => {
      expect(getErrorMessage(error)).toBe(expected);
    });
  });
});
