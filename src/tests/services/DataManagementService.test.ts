import { describe, it, vi, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import {
  DataManagementService,
  ExportError,
} from '@/services/DataManagementService';
import { initializeTestDatabase, cleanupTestData, seedTestData } from './setup';
import { Exam, Grade, School, Subject } from '@/db/entities';

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
  });
});
