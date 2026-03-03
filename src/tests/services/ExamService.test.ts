import { describe, it, vi, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { ExamService } from '@/services/ExamService';
import { getRepositories } from '@/db/data-source';
import { initializeTestDatabase, cleanupTestData, seedTestData } from './setup';
import { Exam } from '@/db/entities/Exam';
import { Grade, School, Subject, Semester } from '@/db/entities';

describe('ExamService', () => {
  let dataSource: DataSource;
  let testData: { school: School; subject: Subject; exam: Exam; grade: Grade };

  // Set up the database before all tests
  beforeAll(async () => {
    // Initialize the test database
    dataSource = await initializeTestDatabase();

    // Mock the getRepositories function to use our test repositories
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

  // Clean up after all tests
  afterAll(async () => {
    await cleanupTestData(dataSource);
    vi.clearAllMocks();
  });

  // Test fetchAll method
  it('should fetch all exams', async () => {
    const exams = await ExamService.fetchAll();
    expect(exams).toBeInstanceOf(Array);
    expect(exams.length).toBeGreaterThan(0);
    expect(exams[0]).toBeInstanceOf(Exam);
    expect(exams[0].name).toBe('Test Exam');
  });

  // Test add method
  it('should add a new exam', async () => {
    const newExamData = {
      schoolId: testData.school.id,
      subjectId: testData.subject.id,
      title: 'New Test Exam',
      date: new Date(),
      description: 'New Test Description',
      weight: 2.0,
    };

    const newExam = await ExamService.add(newExamData);
    expect(newExam).toBeInstanceOf(Exam);
    expect(newExam.id).toBeDefined();
    expect(newExam.name).toBe(newExamData.title); // title is mapped to name
    expect(newExam.date).toBeInstanceOf(Date);
    expect(newExam.description).toBe(newExamData.description);
    expect(newExam.weight).toBe(newExamData.weight);
    expect(newExam.subjectId).toBe(newExamData.subjectId);

    // Verify the exam was actually added to the database
    const exams = await ExamService.fetchAll();
    const foundExam = exams.find((exam) => exam.id === newExam.id);
    expect(foundExam).toBeDefined();
    expect(foundExam?.name).toBe(newExamData.title);
  });

  // Test findById method
  it('should find an exam by id', async () => {
    const exam = await ExamService.findById(testData.exam.id);
    expect(exam).toBeInstanceOf(Exam);
    expect(exam?.id).toBe(testData.exam.id);
    expect(exam?.name).toBe(testData.exam.name);
  });

  // Test findBySubjectId method
  it('should find exams by subject id', async () => {
    const exams = await ExamService.findBySubjectId(testData.subject.id);
    expect(exams).toBeInstanceOf(Array);
    expect(exams.length).toBeGreaterThan(0);
    expect(exams[0]).toBeInstanceOf(Exam);
    expect(exams[0].subjectId).toBe(testData.subject.id);
  });

  // Test update method
  it('should update an exam', async () => {
    const updatedExamData = {
      ...testData.exam,
      name: 'Updated Test Exam',
      description: 'Updated Test Description',
      isCompleted: true,
    };

    const updatedExam = await ExamService.update(updatedExamData);
    expect(updatedExam).toBeInstanceOf(Exam);
    expect(updatedExam.id).toBe(testData.exam.id);
    expect(updatedExam.name).toBe(updatedExamData.name);
    expect(updatedExam.description).toBe(updatedExamData.description);
    expect(updatedExam.isCompleted).toBe(updatedExamData.isCompleted);

    // Verify the exam was actually updated in the database
    const exam = await ExamService.findById(testData.exam.id);
    expect(exam?.name).toBe(updatedExamData.name);
    expect(exam?.description).toBe(updatedExamData.description);
    expect(exam?.isCompleted).toBe(updatedExamData.isCompleted);
  });

  it('should throw an error when updating a non-existent exam', async () => {
    const { exam: examRepo } = getRepositories();
    vi.spyOn(examRepo, 'findOne').mockResolvedValueOnce(null);

    await expect(
      ExamService.update({
        id: 'non-existent-id',
        name: 'X',
      } as unknown as Exam),
    ).rejects.toThrow('not found for update');
  });

  describe('fetchUpcoming', () => {
    it('should fetch upcoming exams via query builder ordered by date ASC', async () => {
      const now = new Date('2026-01-02T10:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const { exam: examRepo } = getRepositories();

      const upcoming = [
        { id: 'e1', name: 'Upcoming 1', date: new Date('2026-01-03') },
        { id: 'e2', name: 'Upcoming 2', date: new Date('2026-01-04') },
      ] as unknown as Exam[];

      const qb = {
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue(upcoming),
      } as unknown as SelectQueryBuilder<Exam>;

      vi.spyOn(examRepo, 'createQueryBuilder').mockReturnValue(qb);

      const result = await ExamService.fetchUpcoming();

      expect(result).toEqual(upcoming);
      expect(examRepo.createQueryBuilder).toHaveBeenCalledWith('exam');
      expect(qb.where).toHaveBeenCalledWith('exam.date >= :now', { now });
      expect(qb.andWhere).toHaveBeenCalledWith('grade.id IS NULL');
      expect(qb.orderBy).toHaveBeenCalledWith('exam.date', 'ASC');
      expect(qb.getMany).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should log and rethrow when query builder fails', async () => {
      const { exam: examRepo } = getRepositories();

      const qb = {
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockRejectedValue(new Error('QB failure')),
      } as unknown as SelectQueryBuilder<Exam>;

      vi.spyOn(examRepo, 'createQueryBuilder').mockReturnValue(qb);
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await expect(ExamService.fetchUpcoming()).rejects.toThrow('QB failure');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch upcoming exams:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  // Test delete method
  it('should delete an exam', async () => {
    // First, add a new exam to delete
    const newExamData = {
      schoolId: testData.school.id,
      subjectId: testData.subject.id,
      title: 'Exam to Delete',
      date: new Date(),
      description: 'Delete Description',
    };
    const newExam = await ExamService.add(newExamData);

    // Delete the exam
    const deletedExamId = await ExamService.delete(newExam.id);
    expect(deletedExamId).toBe(newExam.id);

    // Verify the exam was actually deleted from the database
    const exam = await ExamService.findById(newExam.id);
    expect(exam).toBeNull();
  });

  // Test error handling for delete method
  it('should throw an error when deleting a non-existent exam', async () => {
    await expect(ExamService.delete('non-existent-id')).rejects.toThrow();
  });
});
