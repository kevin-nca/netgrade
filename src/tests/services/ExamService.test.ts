import { describe, it, vi, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import { ExamService } from '@/services/ExamService';
import { initializeTestDatabase, cleanupTestData, seedTestData } from './setup';
import { Exam } from '@/db/entities/Exam';
import { Grade, School, Subject } from '@/db/entities';

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

  it('should fetch only upcoming exams without grades', async () => {
    // Create an exam in the past with a grade
    const pastExamData = {
      schoolId: testData.school.id,
      subjectId: testData.subject.id,
      name: 'Past Exam',
      date: new Date('2023-01-01'),
      description: 'A past exam',
    };
    const pastExam = await ExamService.add(pastExamData);
    
    // Create an upcoming exam with a grade
    const upcomingExamWithGradeData = {
      schoolId: testData.school.id,
      subjectId: testData.subject.id,
      name: 'Upcoming Exam With Grade',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      description: 'An upcoming exam with grade',
    };
    const upcomingExamWithGrade = await ExamService.add(upcomingExamWithGradeData);
    
    // Create an upcoming exam without a grade
    const upcomingExamWithoutGradeData = {
      schoolId: testData.school.id,
      subjectId: testData.subject.id,
      name: 'Upcoming Exam Without Grade',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      description: 'An upcoming exam without grade',
    };
    const upcomingExamWithoutGrade = await ExamService.add(upcomingExamWithoutGradeData);

    const upcomingExams = await ExamService.fetchUpcoming();
    expect(upcomingExams).toHaveLength(1);
    expect(upcomingExams[0].id).toBe(upcomingExamWithoutGrade.id);
  });
});
