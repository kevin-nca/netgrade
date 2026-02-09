import { describe, it, vi, expect, beforeAll, afterAll } from 'vitest';
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

// Mock Capacitor Plugins
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

    it('should throw ExportError when share fails (not cancelled) on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: 'file://path/to/export.xlsx',
      });
      vi.mocked(Share.share).mockRejectedValueOnce(new Error('Sharing failed'));

      const schoolRepo = dataSource.getRepository(School);
      const school = await schoolRepo.findOne({ where: {} });

      await expect(
        DataManagementService.exportData({
          format: 'xlsx',
          filename: 'export_native_fail.xlsx',
          schoolId: school!.id,
        }),
      ).rejects.toThrow(ExportError);

      try {
        await DataManagementService.exportData({
          format: 'xlsx',
          filename: 'export_native_fail.xlsx',
          schoolId: school!.id,
        });
      } catch (error) {
        if (error instanceof ExportError) {
          expect(error.code).toBe('SAVE_FAILED');
          expect(error.message).toBe(
            'Datei wurde gespeichert, Teilen war nicht möglich.',
          );
        }
      }

      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    });

    it('should throw ExportError when file write fails on native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Filesystem.writeFile).mockRejectedValueOnce(
        new Error('permission denied'),
      );

      const schoolRepo = dataSource.getRepository(School);
      const school = await schoolRepo.findOne({ where: {} });

      await expect(
        DataManagementService.exportData({
          format: 'xlsx',
          filename: 'export_native_write_fail.xlsx',
          schoolId: school!.id,
        }),
      ).rejects.toThrow(ExportError);

      try {
        await DataManagementService.exportData({
          format: 'xlsx',
          filename: 'export_native_write_fail.xlsx',
          schoolId: school!.id,
        });
      } catch (error) {
        if (error instanceof ExportError) {
          expect(error.code).toBe('SAVE_FAILED');
          expect(error.message).toBe(
            'Keine Berechtigung zum Speichern von Dateien.',
          );
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

    it('should throw ExportError when share fails (not cancelled) on native platform (JSON)', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: 'file://path/to/backup.json',
      });
      vi.mocked(Share.share).mockRejectedValueOnce(new Error('Sharing failed'));

      await expect(DataManagementService.exportAsJSON()).rejects.toThrow(
        ExportError,
      );

      try {
        await DataManagementService.exportAsJSON();
      } catch (error) {
        if (error instanceof ExportError) {
          expect(error.code).toBe('SAVE_FAILED');
          expect(error.message).toBe(
            'Datei wurde gespeichert, Teilen war nicht möglich.',
          );
        }
      }

      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    });

    it('should throw ExportError when file write fails on native platform (JSON)', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Filesystem.writeFile).mockRejectedValueOnce(
        new Error('permission denied'),
      );

      await expect(DataManagementService.exportAsJSON()).rejects.toThrow(
        ExportError,
      );

      try {
        await DataManagementService.exportAsJSON();
      } catch (error) {
        if (error instanceof ExportError) {
          expect(error.code).toBe('SAVE_FAILED');
          expect(error.message).toBe(
            'Keine Berechtigung zum Speichern von Dateien.',
          );
        }
      }

      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    });
  });

  describe('importFromJSON', () => {
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

    it('should throw PARSE_FAILED error for invalid JSON syntax', async () => {
      const invalidJson = '{ invalid: json ';

      await expect(
        DataManagementService.importFromJSON(invalidJson),
      ).rejects.toThrow(ExportError);

      try {
        await DataManagementService.importFromJSON(invalidJson);
      } catch (error) {
        if (error instanceof ExportError) {
          expect(error.code).toBe('PARSE_FAILED');
        } else {
          throw error;
        }
      }
    });

    it('should throw INVALID_DATA error if schools array is missing', async () => {
      const invalidData = JSON.stringify({
        wrongKey: [],
      });

      await expect(
        DataManagementService.importFromJSON(invalidData),
      ).rejects.toThrow(ExportError);

      try {
        await DataManagementService.importFromJSON(invalidData);
      } catch (error) {
        if (error instanceof ExportError) {
          expect(error.code).toBe('INVALID_DATA');
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

  describe('getErrorMessage', () => {
    const getErrorMessage = (error: unknown) =>
      (
        DataManagementService as unknown as {
          getErrorMessage: (error: unknown) => string;
        }
      ).getErrorMessage(error);

    it('should return file error message if error message contains "file"', () => {
      expect(getErrorMessage(new Error('Some file error occurred'))).toBe(
        'Datei konnte nicht geöffnet werden. Versuchen Sie es erneut.',
      );
    });

    it('should return file error message if error message contains "File"', () => {
      expect(getErrorMessage(new Error('File access denied'))).toBe(
        'Datei konnte nicht geöffnet werden. Versuchen Sie es erneut.',
      );
    });

    it('should return permission error message if error message contains "permission"', () => {
      expect(getErrorMessage(new Error('Write permission denied'))).toBe(
        'Keine Berechtigung zum Speichern von Dateien.',
      );
    });

    it('should return default error message for other errors', () => {
      expect(getErrorMessage(new Error('Share failed'))).toBe(
        'Datei wurde gespeichert, Teilen war nicht möglich.',
      );
    });

    it('should return unknown error message if error is not an Error instance', () => {
      expect(getErrorMessage('Unknown string error')).toBe(
        'Unbekannter Fehler beim Export.',
      );
      expect(getErrorMessage({ code: 500 })).toBe(
        'Unbekannter Fehler beim Export.',
      );
    });
  });
});
