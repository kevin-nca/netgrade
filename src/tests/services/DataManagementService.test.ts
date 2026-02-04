import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import { DataSource } from 'typeorm';
import {
  DataManagementService,
  ExportError,
} from '@/services/DataManagementService';
import { initializeTestDatabase, seedTestData } from './setup';
import { Exam, Grade, School, Subject } from '@/db/entities';

global.URL.createObjectURL = vi.fn(() => 'blob:mocked-url');
global.URL.revokeObjectURL = vi.fn();

describe('DataManagementService', () => {
  let dataSource: DataSource;

  beforeEach(async () => {
    dataSource = await initializeTestDatabase();

    const dataSourceModule = await import('@/db/data-source');
    vi.spyOn(dataSourceModule, 'getDataSource').mockReturnValue(dataSource);
    vi.spyOn(dataSourceModule, 'getRepositories').mockReturnValue({
      school: dataSource.getRepository(School),
      subject: dataSource.getRepository(Subject),
      exam: dataSource.getRepository(Exam),
      grade: dataSource.getRepository(Grade),
    });

    await seedTestData(dataSource);
  });

  afterEach(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
    vi.clearAllMocks();
  });

  it('should delete all data from all tables', async () => {
    const schoolRepo = dataSource.getRepository(School);
    const subjectRepo = dataSource.getRepository(Subject);
    const examRepo = dataSource.getRepository(Exam);
    const gradeRepo = dataSource.getRepository(Grade);

    expect(await schoolRepo.count()).toBeGreaterThan(0);
    expect(await subjectRepo.count()).toBeGreaterThan(0);
    expect(await examRepo.count()).toBeGreaterThan(0);
    expect(await gradeRepo.count()).toBeGreaterThan(0);

    await DataManagementService.resetAllData();

    expect(await schoolRepo.count()).toBe(0);
    expect(await subjectRepo.count()).toBe(0);
    expect(await examRepo.count()).toBe(0);
    expect(await gradeRepo.count()).toBe(0);
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
  });

  describe('exportAsJSON', () => {
    it('should export all data as JSON successfully', async () => {
      const result = await DataManagementService.exportAsJSON();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Export erfolgreich heruntergeladen.');
      expect(result.filename).toMatch(/^backup_\d{4}-\d{2}-\d{2}\.json$/);
    });

    it('should handle empty database', async () => {
      const freshDataSource = await initializeTestDatabase();

      const dataSourceModule = await import('@/db/data-source');
      vi.spyOn(dataSourceModule, 'getDataSource').mockReturnValue(
        freshDataSource,
      );
      vi.spyOn(dataSourceModule, 'getRepositories').mockReturnValue({
        school: freshDataSource.getRepository(School),
        subject: freshDataSource.getRepository(Subject),
        exam: freshDataSource.getRepository(Exam),
        grade: freshDataSource.getRepository(Grade),
      });

      const result = await DataManagementService.exportAsJSON();

      expect(result.success).toBe(true);
      expect(result.filename).toMatch(/^backup_\d{4}-\d{2}-\d{2}\.json$/);

      await freshDataSource.destroy();
    });
  });

  describe('importFromJSON', () => {
    it(
      'should import valid JSON data successfully',
      { timeout: 10000 },
      async () => {
        const freshDataSource = await initializeTestDatabase();

        const dataSourceModule = await import('@/db/data-source');
        vi.spyOn(dataSourceModule, 'getDataSource').mockReturnValue(
          freshDataSource,
        );
        vi.spyOn(dataSourceModule, 'getRepositories').mockReturnValue({
          school: freshDataSource.getRepository(School),
          subject: freshDataSource.getRepository(Subject),
          exam: freshDataSource.getRepository(Exam),
          grade: freshDataSource.getRepository(Grade),
        });

        const validJSON = JSON.stringify({
          schools: [
            {
              id: 'test-school-1',
              name: 'Test School',
              appInstanceId: 'test-instance',
              subjects: [
                {
                  id: 'test-subject-1',
                  name: 'Math',
                  teacher: 'Mr. Smith',
                  weight: 1,
                  appInstanceId: 'test-instance',
                  exams: [
                    {
                      id: 'test-exam-1',
                      name: 'Midterm',
                      date: '2024-01-15',
                      appInstanceId: 'test-instance',
                      grade: {
                        id: 'test-grade-1',
                        score: 5.5,
                        weight: 0.5,
                        date: '2024-01-15',
                        comment: 'Good work',
                        counts: true,
                        appInstanceId: 'test-instance',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        });

        await DataManagementService.importFromJSON(validJSON);

        const schoolRepo = freshDataSource.getRepository(School);
        const schools = await schoolRepo.find({
          relations: { subjects: { exams: { grade: true } } },
        });

        expect(schools).toHaveLength(1);
        expect(schools[0].name).toBe('Test School');
        expect(schools[0].subjects).toHaveLength(1);
        expect(schools[0].subjects[0].exams).toHaveLength(1);

        await freshDataSource.destroy();
      },
    );

    it('should handle invalid JSON format', async () => {
      const invalidJSON = 'not valid json';

      await expect(
        DataManagementService.importFromJSON(invalidJSON),
      ).rejects.toThrow();
    });

    it('should handle missing schools property', async () => {
      const invalidJSON = JSON.stringify({ data: [] });

      await expect(
        DataManagementService.importFromJSON(invalidJSON),
      ).rejects.toThrow();
    });

    it('should rollback on import failure', async () => {
      const initialSchoolCount = await dataSource.getRepository(School).count();

      const invalidJSON = JSON.stringify({
        schools: [
          {
            name: null,
          },
        ],
      });

      await expect(
        DataManagementService.importFromJSON(invalidJSON),
      ).rejects.toThrow();

      const finalSchoolCount = await dataSource.getRepository(School).count();
      expect(finalSchoolCount).toBe(initialSchoolCount);
    });
  });
});
