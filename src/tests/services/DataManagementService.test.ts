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

    it('should export school data as XLSX', async () => {
      const schoolRepo = dataSource.getRepository(School);
      const school = await schoolRepo.findOne({ where: {} });
      expect(school).toBeTruthy();
      const result = await DataManagementService.exportData({
        format: 'xlsx',
        filename: 'export.xlsx',
        schoolId: school!.id,
      });

      expect(result).toEqual({
        success: true,
        message: 'Export erfolgreich heruntergeladen.',
        filename: 'export.xlsx',
      });
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

    it('should export all schools when schoolId is "all"', async () => {
      const result = await DataManagementService.exportData({
        format: 'xlsx',
        filename: 'export_all.xlsx',
        schoolId: 'all',
      });

      expect(result).toEqual({
        success: true,
        message: 'Export erfolgreich heruntergeladen.',
        filename: 'export_all.xlsx',
      });
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

    it('should create overview sheet with correct statistics when exporting all schools', async () => {
      const schoolRepo = dataSource.getRepository(School);
      const school2 = schoolRepo.create({ name: 'Second School' });
      await schoolRepo.save(school2);

      const semesterRepo = dataSource.getRepository(Semester);
      const semester = await semesterRepo.findOne({ where: {} });

      const subjectRepo = dataSource.getRepository(Subject);
      const subject2 = subjectRepo.create({
        name: 'Second Subject',
        school: school2,
        semester: semester!,
      });
      await subjectRepo.save(subject2);

      const examRepo = dataSource.getRepository(Exam);
      const exam2 = examRepo.create({
        name: 'Second Exam',
        date: new Date('2024-05-15'),
        subject: subject2,
        isCompleted: true,
      });
      await examRepo.save(exam2);

      const gradeRepo = dataSource.getRepository(Grade);
      const grade2 = gradeRepo.create({
        score: 4.0,
        weight: 1,
        date: new Date('2024-05-15'),
        exam: exam2,
      });
      await gradeRepo.save(grade2);

      const aoaSpy = vi.spyOn(XLSX.utils, 'aoa_to_sheet');

      await DataManagementService.exportData({
        format: 'xlsx',
        filename: 'all_schools.xlsx',
        schoolId: 'all',
      });

      const overviewCall = aoaSpy.mock.calls.find((call) => {
        const data = call[0] as unknown[][];
        return (
          data &&
          data[0] &&
          data[0][0] === 'NetGrade Datenexport - Alle Schulen'
        );
      });
      expect(overviewCall).toBeDefined();

      const summaryCall = aoaSpy.mock.calls.find((call) => {
        const data = call[0] as unknown[][];
        return (
          data && data[0] && data[0][0] === 'NetGrade Gesamtzusammenfassung'
        );
      });
      expect(summaryCall).toBeDefined();

      aoaSpy.mockRestore();
    });

    it('should handle school with special characters in name for sheet naming', async () => {
      const schoolRepo = dataSource.getRepository(School);
      const school = schoolRepo.create({ name: 'School/With[Special]Chars?' });
      await schoolRepo.save(school);

      const semesterRepo = dataSource.getRepository(Semester);
      const semester = await semesterRepo.findOne({ where: {} });

      const subjectRepo = dataSource.getRepository(Subject);
      const subject = subjectRepo.create({
        name: 'Subject',
        school,
        semester: semester!,
      });
      await subjectRepo.save(subject);

      const appendSheetSpy = vi.spyOn(XLSX.utils, 'book_append_sheet');

      await DataManagementService.exportData({
        format: 'xlsx',
        filename: 'special_chars.xlsx',
        schoolId: 'all',
      });

      const calls = appendSheetSpy.mock.calls;
      calls.forEach((call) => {
        const sheetName = call[2] as string;
        expect(sheetName).not.toMatch(/[[\]\\/?*]/);
      });

      appendSheetSpy.mockRestore();
    });

    it('should export school with no completed exams showing dash for average', async () => {
      const schoolRepo = dataSource.getRepository(School);
      const school = schoolRepo.create({ name: 'No Grades School' });
      await schoolRepo.save(school);

      const semesterRepo = dataSource.getRepository(Semester);
      const semester = await semesterRepo.findOne({ where: {} });

      const subjectRepo = dataSource.getRepository(Subject);
      const subject = subjectRepo.create({
        name: 'Incomplete Subject',
        school,
        semester: semester!,
      });
      await subjectRepo.save(subject);

      const examRepo = dataSource.getRepository(Exam);
      const exam = examRepo.create({
        name: 'Incomplete Exam',
        date: new Date('2024-06-01'),
        subject,
        isCompleted: false,
      });
      await examRepo.save(exam);

      const aoaSpy = vi.spyOn(XLSX.utils, 'aoa_to_sheet');

      await DataManagementService.exportData({
        format: 'xlsx',
        filename: 'no_grades.xlsx',
        schoolId: 'all',
      });

      const overviewCall = aoaSpy.mock.calls.find((call) => {
        const data = call[0] as unknown[][];
        return (
          data &&
          data[0] &&
          data[0][0] === 'NetGrade Datenexport - Alle Schulen'
        );
      });
      expect(overviewCall).toBeDefined();

      const overviewData = overviewCall![0] as unknown[][];
      const noGradesRow = overviewData.find(
        (row) => row[0] === 'No Grades School',
      );
      expect(noGradesRow).toBeDefined();
      expect(noGradesRow![4]).toBe('-');

      aoaSpy.mockRestore();
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
      const semester = await semesterRepo.findOne({ where: {} });

      const subjectRepo = dataSource.getRepository(Subject);
      const subject = subjectRepo.create({
        name: 'Unique Subject',
        school: uniqueSchool,
        weight: 1,
        semester: semester!,
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
      const semester = await semesterRepo.findOne({ where: {} });

      const subjectRepo = dataSource.getRepository(Subject);
      const subject = subjectRepo.create({
        name: 'Avg Test Subject',
        school,
        semester: semester!,
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
      const grade = gradeRepo.create({
        exam,
        score: 2.5,
        weight: 1,
        date: new Date(),
      });
      await gradeRepo.save(grade);

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

    it('should throw UNKNOWN error when unexpected error occurs in exportData', async () => {
      const schoolRepo = dataSource.getRepository(School);
      const findSpy = vi
        .spyOn(schoolRepo, 'find')
        .mockRejectedValue(new Error('Unexpected database error'));

      await expect(
        DataManagementService.exportData({
          format: 'xlsx',
          filename: 'test.xlsx',
          schoolId: 'all',
        }),
      ).rejects.toThrow(ExportError);

      try {
        await DataManagementService.exportData({
          format: 'xlsx',
          filename: 'test.xlsx',
          schoolId: 'all',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ExportError);
        if (error instanceof ExportError) {
          expect(error.code).toBe('UNKNOWN');
          expect(error.message).toBe(
            'Export fehlgeschlagen. Bitte versuchen Sie es erneut.',
          );
        }
      }

      findSpy.mockRestore();
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
      const semesterRepo = dataSource.getRepository(Semester);
      const findSchoolSpy = vi.spyOn(schoolRepo, 'find').mockResolvedValue([]);
      const findSemesterSpy = vi
        .spyOn(semesterRepo, 'find')
        .mockResolvedValue([]);

      await expect(DataManagementService.exportAsJSON()).rejects.toThrow(
        ExportError,
      );

      findSchoolSpy.mockRestore();
      findSemesterSpy.mockRestore();
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
            id: 'test-school-id',
            name: 'Test School',
            subjects: [
              {
                id: 'test-subject-id',
                name: 'Test Subject',
                exams: [
                  {
                    id: 'test-exam-id',
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

      const saveSpy = vi.fn().mockResolvedValue([]);
      const querySpy = vi.fn();
      const updateSpy = vi.fn();

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
            getRepository: () => ({ save: saveSpy, update: updateSpy }),
          } as unknown as EntityManager;
          return cb(mockManager);
        },
      );

      await DataManagementService.importFromJSON(validJson);

      // The service saves exams in the third save call (after schools and subjects)
      // Find the save call that includes the exam with the date
      const examSaveCall = saveSpy.mock.calls.find(
        (call) =>
          Array.isArray(call[0]) &&
          call[0].length > 0 &&
          call[0][0].date instanceof Date,
      );

      expect(examSaveCall).toBeDefined();
      const examDate = examSaveCall![0][0].date;

      expect(examDate).toBeInstanceOf(Date);
      expect(examDate.toISOString().startsWith('2023-12-24')).toBe(true);
    });

    it('should successfully import valid backup data', async () => {
      const semesterRepo = dataSource.getRepository(Semester);
      let semester = await semesterRepo.findOne({ where: {} });
      if (!semester) {
        semester = semesterRepo.create({
          name: '2024/2025 Link',
          startDate: new Date('2024-08-15'),
          endDate: new Date('2025-07-31'),
        });
        await semesterRepo.save(semester);
      }

      const schoolRepo = dataSource.getRepository(School);
      const originalSchool = schoolRepo.create({
        name: 'Export Import School',
        type: 'Test',
        address: 'Test Addr',
      });
      await schoolRepo.save(originalSchool);

      const subjectRepo = dataSource.getRepository(Subject);
      const originalSubject = subjectRepo.create({
        name: 'Export Import Subject',
        weight: 1,
        school: originalSchool,
        semester: semester,
      });
      await subjectRepo.save(originalSubject);

      const schoolsForExport = await schoolRepo.find({
        relations: { subjects: { exams: { grade: true } } },
        where: { id: originalSchool.id },
      });

      schoolsForExport[0].subjects[0].semester = semester;

      const validJson = JSON.stringify(
        { schools: schoolsForExport },
        (key, value) => {
          if (typeof value === 'object' && value instanceof Date)
            return value.toISOString().split('T')[0];
          return value;
        },
      );

      const cleanJson = JSON.parse(validJson);
      delete cleanJson.schools[0].id;
      if (
        cleanJson.schools[0].subjects &&
        cleanJson.schools[0].subjects.length > 0
      ) {
        delete cleanJson.schools[0].subjects[0].id;
        delete cleanJson.schools[0].subjects[0].schoolId;

        if (
          cleanJson.schools[0].subjects[0].exams &&
          cleanJson.schools[0].subjects[0].exams.length > 0
        ) {
          delete cleanJson.schools[0].subjects[0].exams[0].id;
          delete cleanJson.schools[0].subjects[0].exams[0].subjectId;

          if (cleanJson.schools[0].subjects[0].exams[0].grade) {
            delete cleanJson.schools[0].subjects[0].exams[0].grade.id;
            delete cleanJson.schools[0].subjects[0].exams[0].grade.examId;
          }
        }
      }
      const schoolRef = cleanJson.schools[0];
      if (schoolRef.subjects) {
        schoolRef.subjects.forEach((subj: Subject) => {
          subj.school = schoolRef as unknown as School;
          if (subj.exams) {
            subj.exams.forEach((ex: Exam) => {
              ex.subject = subj;
              if (ex.grade) {
                ex.grade.exam = ex;
              }
            });
          }
        });
      }
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

      const validJson = JSON.stringify({
        schools: [],
      });

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

    it('should import semesters when present in backup', async () => {
      const validJson = JSON.stringify({
        schools: [{ id: 'school-1', name: 'Test School', subjects: [] }],
        semesters: [
          {
            id: 'semester-1',
            name: '2024/2025',
            startDate: '2024-08-15',
            endDate: '2025-07-31',
          },
        ],
      });

      const saveSpy = vi.fn().mockResolvedValue([]);
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
            getRepository: () => ({ save: saveSpy, update: vi.fn() }),
          } as unknown as EntityManager;
          return cb(mockManager);
        },
      );

      await DataManagementService.importFromJSON(validJson);

      const semesterSaveCall = saveSpy.mock.calls.find(
        (call) =>
          Array.isArray(call[0]) &&
          call[0].length > 0 &&
          call[0][0].startDate instanceof Date &&
          call[0][0].name === '2024/2025',
      );

      expect(semesterSaveCall).toBeDefined();
      expect(semesterSaveCall![0][0]).toMatchObject({
        id: 'semester-1',
        name: '2024/2025',
      });
    });

    it('should import grades and update exam references', async () => {
      const validJson = JSON.stringify({
        schools: [
          {
            id: 'school-1',
            name: 'Test School',
            subjects: [
              {
                id: 'subject-1',
                name: 'Test Subject',
                exams: [
                  {
                    id: 'exam-1',
                    name: 'Test Exam',
                    date: '2023-12-24',
                    isCompleted: true,
                    grade: {
                      id: 'grade-1',
                      score: 5.5,
                      weight: 1,
                      date: '2023-12-24',
                    },
                  },
                ],
              },
            ],
          },
        ],
      });

      const saveSpy = vi.fn().mockResolvedValue([]);
      const querySpy = vi.fn();
      const updateSpy = vi.fn().mockResolvedValue({ affected: 1 });

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
            getRepository: () => ({ save: saveSpy, update: updateSpy }),
          } as unknown as EntityManager;
          return cb(mockManager);
        },
      );

      await DataManagementService.importFromJSON(validJson);

      const gradeSaveCall = saveSpy.mock.calls.find(
        (call) =>
          Array.isArray(call[0]) &&
          call[0].length > 0 &&
          call[0][0].score === 5.5,
      );

      expect(gradeSaveCall).toBeDefined();
      expect(gradeSaveCall![0][0]).toMatchObject({
        id: 'grade-1',
        score: 5.5,
        examId: 'exam-1',
      });

      expect(updateSpy).toHaveBeenCalledWith(
        { id: 'exam-1' },
        { gradeId: 'grade-1' },
      );
    });

    it('should handle import with missing semesters array (defaults to empty array)', async () => {
      const validJson = JSON.stringify({
        schools: [{ id: 'school-1', name: 'Test School', subjects: [] }],
      });

      const saveSpy = vi.fn().mockResolvedValue([]);
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
            getRepository: () => ({ save: saveSpy, update: vi.fn() }),
          } as unknown as EntityManager;
          return cb(mockManager);
        },
      );

      await DataManagementService.importFromJSON(validJson);

      const schoolSaveCall = saveSpy.mock.calls.find(
        (call) =>
          Array.isArray(call[0]) &&
          call[0].length > 0 &&
          call[0][0].name === 'Test School',
      );
      expect(schoolSaveCall).toBeDefined();
    });

    it('should handle import with schools having null subjects', async () => {
      const validJson = JSON.stringify({
        schools: [{ id: 'school-1', name: 'School With Null Subjects' }],
      });

      const saveSpy = vi.fn().mockResolvedValue([]);
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
            getRepository: () => ({ save: saveSpy, update: vi.fn() }),
          } as unknown as EntityManager;
          return cb(mockManager);
        },
      );

      await DataManagementService.importFromJSON(validJson);

      expect(querySpy).toHaveBeenCalledWith('DELETE FROM grade');
      expect(querySpy).toHaveBeenCalledWith('DELETE FROM exam');
      expect(querySpy).toHaveBeenCalledWith('DELETE FROM subject');
      expect(querySpy).toHaveBeenCalledWith('DELETE FROM semester');
      expect(querySpy).toHaveBeenCalledWith('DELETE FROM school');
    });

    it('should handle import with subjects having null exams', async () => {
      const validJson = JSON.stringify({
        schools: [
          {
            id: 'school-1',
            name: 'School',
            subjects: [{ id: 'subject-1', name: 'Subject Without Exams' }],
          },
        ],
      });

      const saveSpy = vi.fn().mockResolvedValue([]);
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
            getRepository: () => ({ save: saveSpy, update: vi.fn() }),
          } as unknown as EntityManager;
          return cb(mockManager);
        },
      );

      await DataManagementService.importFromJSON(validJson);

      const subjectSaveCall = saveSpy.mock.calls.find(
        (call) =>
          Array.isArray(call[0]) &&
          call[0].length > 0 &&
          call[0][0].name === 'Subject Without Exams',
      );
      expect(subjectSaveCall).toBeDefined();
      expect(subjectSaveCall![0][0].schoolId).toBe('school-1');
    });

    it('should handle import with exams that have no grade', async () => {
      const validJson = JSON.stringify({
        schools: [
          {
            id: 'school-1',
            name: 'School',
            subjects: [
              {
                id: 'subject-1',
                name: 'Subject',
                exams: [
                  {
                    id: 'exam-1',
                    name: 'Exam Without Grade',
                    date: '2024-01-15',
                    isCompleted: false,
                  },
                ],
              },
            ],
          },
        ],
      });

      const saveSpy = vi.fn().mockResolvedValue([]);
      const querySpy = vi.fn();
      const updateSpy = vi.fn();

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
            getRepository: () => ({ save: saveSpy, update: updateSpy }),
          } as unknown as EntityManager;
          return cb(mockManager);
        },
      );

      await DataManagementService.importFromJSON(validJson);

      const examSaveCall = saveSpy.mock.calls.find(
        (call) =>
          Array.isArray(call[0]) &&
          call[0].length > 0 &&
          call[0][0].name === 'Exam Without Grade',
      );
      expect(examSaveCall).toBeDefined();
      expect(examSaveCall![0][0].grade).toBeNull();
      expect(examSaveCall![0][0].gradeId).toBeNull();

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should export semesters in JSON backup', async () => {
      await DataManagementService.resetAllData();

      const semesterRepo = dataSource.getRepository(Semester);
      const semester = new Semester();
      semester.name = 'Export Semester Test';
      semester.startDate = new Date('2024-08-15');
      semester.endDate = new Date('2025-07-31');
      await semesterRepo.save(semester);

      const schoolRepo = dataSource.getRepository(School);
      const school = new School();
      school.name = 'Semester Export School';
      await schoolRepo.save(school);

      (global.URL.createObjectURL as Mock).mockClear();

      await DataManagementService.exportAsJSON();

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      const blob = (global.URL.createObjectURL as Mock).mock
        .calls[0][0] as Blob;
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(blob);
      });
      const json = JSON.parse(text);

      expect(json.semesters).toBeDefined();
      expect(json.semesters.length).toBeGreaterThan(0);

      // Find the specific semester we created
      const exportedSemester = json.semesters.find(
        (s: { name: string }) => s.name === 'Export Semester Test',
      );
      expect(exportedSemester).toBeDefined();
      expect(exportedSemester.startDate).toBe('2024-08-15');
      expect(exportedSemester.endDate).toBe('2025-07-31');
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

  describe('blobToBase64', () => {
    const blobToBase64 = (blob: Blob) =>
      (
        DataManagementService as unknown as {
          blobToBase64: (blob: Blob) => Promise<string>;
        }
      ).blobToBase64(blob);

    it('should convert blob to base64 string', async () => {
      const content = 'Hello World';
      const blob = new Blob([content], { type: 'text/plain' });
      const result = await blobToBase64(blob);
      expect(result).toBe(btoa(content));
    });

    it('should handle empty blob', async () => {
      const blob = new Blob([''], { type: 'text/plain' });
      const result = await blobToBase64(blob);
      expect(result).toBe('');
    });
  });

  describe('calculateSummaries', () => {
    const calculateSummaries = (schools: School[]) =>
      (
        DataManagementService as unknown as {
          calculateSummaries: (schools: School[]) => {
            perSubjectAverages: Record<string, number>;
            overallAverage: number;
            examsCompleted: number;
            examsTotal: number;
          };
        }
      ).calculateSummaries(schools);

    it('should return zero averages for empty schools', () => {
      const result = calculateSummaries([]);
      expect(result.overallAverage).toBe(0);
      expect(result.examsCompleted).toBe(0);
      expect(result.examsTotal).toBe(0);
      expect(Object.keys(result.perSubjectAverages)).toHaveLength(0);
    });

    it('should calculate correct weighted averages', () => {
      const school = new School();
      school.name = 'Test School';
      school.subjects = [
        {
          id: '1',
          name: 'Math',
          weight: 2,
          exams: [
            {
              id: '1',
              name: 'Exam 1',
              isCompleted: true,
              weight: 1,
              grade: { score: 4.0, weight: 1 },
            } as Exam,
            {
              id: '2',
              name: 'Exam 2',
              isCompleted: true,
              weight: 2,
              grade: { score: 5.0, weight: 1 },
            } as Exam,
          ],
        } as Subject,
        {
          id: '2',
          name: 'English',
          weight: 1,
          exams: [
            {
              id: '3',
              name: 'Exam 3',
              isCompleted: true,
              weight: 1,
              grade: { score: 6.0, weight: 1 },
            } as Exam,
          ],
        } as Subject,
      ];

      const result = calculateSummaries([school]);

      expect(result.perSubjectAverages['Math']).toBeCloseTo(4.67, 1);
      expect(result.perSubjectAverages['English']).toBe(6.0);
      expect(result.examsCompleted).toBe(3);
      expect(result.examsTotal).toBe(3);
    });

    it('should handle exams without grades', () => {
      const school = new School();
      school.name = 'Test School';
      school.subjects = [
        {
          id: '1',
          name: 'Math',
          weight: 1,
          exams: [
            { id: '1', name: 'Exam 1', isCompleted: false, weight: 1 } as Exam,
            { id: '2', name: 'Exam 2', isCompleted: true, grade: null } as Exam,
          ],
        } as Subject,
      ];

      const result = calculateSummaries([school]);

      expect(result.overallAverage).toBe(0);
      expect(result.examsCompleted).toBe(0);
      expect(result.examsTotal).toBe(2);
    });

    it('should prefix subject names with school name for multiple schools', () => {
      const school1 = new School();
      school1.name = 'School A';
      school1.subjects = [
        {
          id: '1',
          name: 'Math',
          weight: 1,
          exams: [
            {
              id: '1',
              name: 'Exam 1',
              isCompleted: true,
              weight: 1,
              grade: { score: 5.0, weight: 1 },
            } as Exam,
          ],
        } as Subject,
      ];

      const school2 = new School();
      school2.name = 'School B';
      school2.subjects = [
        {
          id: '2',
          name: 'Math',
          weight: 1,
          exams: [
            {
              id: '2',
              name: 'Exam 2',
              isCompleted: true,
              weight: 1,
              grade: { score: 4.0, weight: 1 },
            } as Exam,
          ],
        } as Subject,
      ];

      const result = calculateSummaries([school1, school2]);

      expect(result.perSubjectAverages['School A - Math']).toBe(5.0);
      expect(result.perSubjectAverages['School B - Math']).toBe(4.0);
    });

    it('should handle subjects and exams without explicit weight (default to 1)', () => {
      const school = new School();
      school.name = 'Test School';
      school.subjects = [
        {
          id: '1',
          name: 'Science',
          exams: [
            {
              id: '1',
              name: 'Exam 1',
              isCompleted: true,
              grade: { score: 5.5, weight: 1 },
            } as Exam,
          ],
        } as Subject,
      ];

      const result = calculateSummaries([school]);

      expect(result.perSubjectAverages['Science']).toBe(5.5);
      expect(result.overallAverage).toBe(5.5);
    });
  });

  it('should format dates as YYYY-MM-DD in JSON export', async () => {
    await DataManagementService.resetAllData();
    const schoolRepo = dataSource.getRepository(School);
    const school = new School();
    school.name = 'Date Test School';
    await schoolRepo.save(school);

    const semesterRepo = dataSource.getRepository(Semester);
    const semester = new Semester();
    semester.name = 'Date Test Semester';
    semester.startDate = new Date('2024-01-01');
    semester.endDate = new Date('2024-12-31');
    await semesterRepo.save(semester);

    const subject = new Subject();
    subject.name = 'Date Subject';
    subject.school = school;
    subject.semester = semester;
    await dataSource.getRepository(Subject).save(subject);

    const exam = new Exam();
    exam.name = 'Date Exam';
    exam.date = new Date('2023-12-25T12:00:00.000Z');
    exam.subject = subject;
    await dataSource.getRepository(Exam).save(exam);

    (global.URL.createObjectURL as Mock).mockClear();

    await DataManagementService.exportAsJSON();

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    const blob = (global.URL.createObjectURL as Mock).mock.calls[0][0] as Blob;
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(blob);
    });
    const json = JSON.parse(text);

    const dateSchool = json.schools.find(
      (s: { name: string }) => s.name === 'Date Test School',
    );
    expect(dateSchool).toBeDefined();
    expect(dateSchool.subjects[0].exams[0].date).toMatch(/^2023-12-25/);
  });
});
