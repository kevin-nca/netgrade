import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { DataSource } from 'typeorm';
import { SemesterService } from '@/services/SemesterService';
import { cleanupTestData, initializeTestDatabase, seedTestData } from './setup';
import { Semester } from '@/db/entities/Semester';
import { Exam, Grade, School, Subject } from '@/db/entities';

describe('SemesterService', () => {
  let dataSource: DataSource;
  let testData: {
    school: School;
    semester: Semester;
    subject: Subject;
    exam: Exam;
    grade: Grade;
  };

  beforeAll(async () => {
    dataSource = await initializeTestDatabase();

    const dataSourceModule = await import('@/db/data-source');
    vi.spyOn(dataSourceModule, 'getRepositories').mockReturnValue({
      school: dataSource.getRepository(School),
      subject: dataSource.getRepository(Subject),
      exam: dataSource.getRepository(Exam),
      grade: dataSource.getRepository(Grade),
      semester: dataSource.getRepository(Semester),
    });

    testData = await seedTestData(dataSource);
  });

  afterAll(async () => {
    await cleanupTestData(dataSource);
    vi.clearAllMocks();
  });

  it('should fetch all semesters', async () => {
    const semesters = await SemesterService.fetchAll();
    expect(semesters).toBeInstanceOf(Array);
    expect(semesters.length).toBeGreaterThan(0);
    expect(semesters[0]).toBeInstanceOf(Semester);
    expect(semesters[0].name).toBe('2024/2025');
  });

  it('should throw error and log when fetchAll fails', async () => {
    const testError = new Error('Database fetch error');
    const consoleSpy = vi.spyOn(console, 'error');
    const dataSourceModule = await import('@/db/data-source');

    vi.spyOn(dataSourceModule, 'getRepositories').mockReturnValueOnce({
      semester: {
        find: vi.fn().mockRejectedValue(testError),
      },
    } as never);

    await expect(SemesterService.fetchAll()).rejects.toThrow(
      'Database fetch error',
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to fetch semesters:',
      testError,
    );
  });

  it('should add a new semester', async () => {
    const newSemesterData = {
      name: '2025/2026',
      startDate: new Date('2025-08-15'),
      endDate: new Date('2026-07-31'),
      schoolId: testData.school.id,
    };

    const newSemester = await SemesterService.add(newSemesterData);
    expect(newSemester).toBeInstanceOf(Semester);
    expect(newSemester.id).toBeDefined();
    expect(newSemester.name).toBe(newSemesterData.name);
    expect(newSemester.schoolId).toBe(testData.school.id);

    const semesters = await SemesterService.fetchAll();
    const foundSemester = semesters.find((s) => s.id === newSemester.id);
    expect(foundSemester).toBeDefined();
    expect(foundSemester?.name).toBe(newSemesterData.name);
  });

  it('should throw error and log when add fails', async () => {
    const testError = new Error('Database add error');
    const consoleSpy = vi.spyOn(console, 'error');
    const dataSourceModule = await import('@/db/data-source');

    vi.spyOn(dataSourceModule, 'getRepositories').mockReturnValueOnce({
      semester: {
        create: vi.fn().mockReturnValue({}),
        save: vi.fn().mockRejectedValue(testError),
      },
    } as never);

    const newSemesterData = {
      name: '2025/2026',
      startDate: new Date('2025-08-15'),
      endDate: new Date('2026-07-31'),
      schoolId: testData.school.id,
    };

    await expect(SemesterService.add(newSemesterData)).rejects.toThrow(
      'Database add error',
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to add semester:',
      testError,
    );
  });

  it('should find a semester by id', async () => {
    const semester = await SemesterService.findById(testData.semester.id);
    expect(semester).toBeInstanceOf(Semester);
    expect(semester?.id).toBe(testData.semester.id);
    expect(semester?.name).toBe(testData.semester.name);
  });

  it('should throw error and log when findById fails', async () => {
    const testError = new Error('Database findById error');
    const consoleSpy = vi.spyOn(console, 'error');
    const dataSourceModule = await import('@/db/data-source');

    vi.spyOn(dataSourceModule, 'getRepositories').mockReturnValueOnce({
      semester: {
        findOne: vi.fn().mockRejectedValue(testError),
      },
    } as never);

    const testId = 'test-id';

    await expect(SemesterService.findById(testId)).rejects.toThrow(
      'Database findById error',
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      `Failed to find semester with ID ${testId}:`,
      testError,
    );
  });

  it('should update a semester', async () => {
    const updatedSemesterData = {
      ...testData.semester,
      name: '2024/2025 - Updated',
      startDate: new Date('2024-08-20'),
    };

    const updatedSemester = await SemesterService.update(updatedSemesterData);
    expect(updatedSemester).toBeInstanceOf(Semester);
    expect(updatedSemester.id).toBe(testData.semester.id);
    expect(updatedSemester.name).toBe(updatedSemesterData.name);

    const semester = await SemesterService.findById(testData.semester.id);
    expect(semester?.name).toBe(updatedSemesterData.name);
  });

  it('should delete a semester', async () => {
    const newSemesterData = {
      name: 'Semester to Delete',
      startDate: new Date('2025-08-15'),
      endDate: new Date('2026-07-31'),
      schoolId: testData.school.id,
    };
    const newSemester = await SemesterService.add(newSemesterData);

    const deletedSemesterId = await SemesterService.delete(newSemester.id);
    expect(deletedSemesterId).toBe(newSemester.id);

    const semester = await SemesterService.findById(newSemester.id);
    expect(semester).toBeNull();
  });

  it('should throw an error when deleting a non-existent semester', async () => {
    await expect(SemesterService.delete('non-existent-id')).rejects.toThrow();
  });

  it('should throw an error when updating a non-existent semester', async () => {
    await expect(
      SemesterService.update({ id: 'non-existent-id', name: 'Updated Name' }),
    ).rejects.toThrow();
  });
});
