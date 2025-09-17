import { describe, it, vi, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import { GradeService, AddExamAndGradePayload } from '@/services/GradeService';
import { initializeTestDatabase, cleanupTestData, seedTestData } from './setup';
import { Grade } from '@/db/entities/Grade';
import { Exam } from '@/db/entities/Exam';
import { School, Subject } from '@/db/entities';

describe('GradeService', () => {
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

    // Also mock the getDataSource function to return our test dataSource
    vi.spyOn(dataSourceModule, 'getDataSource').mockReturnValue(dataSource);

    testData = await seedTestData(dataSource);
  });

  // Clean up after all tests
  afterAll(async () => {
    await cleanupTestData(dataSource);
    vi.clearAllMocks();
  });

  // Test fetchAll method
  it('should fetch all grades', async () => {
    const grades = await GradeService.fetchAll();
    expect(grades).toBeInstanceOf(Array);
    expect(grades.length).toBeGreaterThan(0);
    expect(grades[0]).toBeInstanceOf(Grade);
    expect(grades[0].score).toBe(85);
  });

  it('should add a new grade with an exam and maintain bidirectional relationship', async () => {
    const newGradeData: AddExamAndGradePayload = {
      subjectId: testData.subject.id,
      examName: 'New Test Exam with Grade',
      date: new Date(),
      score: 90,
      weight: 1.5,
      comment: 'New Test Comment',
    };

    const newGrade = await GradeService.addWithExam(newGradeData);
    expect(newGrade).toBeInstanceOf(Grade);
    expect(newGrade.id).toBeDefined();
    expect(newGrade.score).toBe(newGradeData.score);
    expect(newGrade.weight).toBe(newGradeData.weight);
    expect(newGrade.comment).toBe(newGradeData.comment);
    expect(newGrade.date).toBeInstanceOf(Date);

    // Check that the exam was created and linked to the grade
    expect(newGrade.exam).toBeDefined();
    expect(newGrade.exam.id).toBeDefined();
    expect(newGrade.exam.name).toBe(newGradeData.examName);
    expect(newGrade.exam.subjectId).toBe(newGradeData.subjectId);
    expect(newGrade.exam.isCompleted).toBe(true);

    expect(newGrade.exam.gradeId).toBe(newGrade.id);

    const dataSourceModule = await import('@/db/data-source');
    const { exam: examRepo } = dataSourceModule.getRepositories();
    const examFromDb = await examRepo.findOne({
      where: { id: newGrade.exam.id },
      relations: ['grade'],
    });

    expect(examFromDb).toBeDefined();
    expect(examFromDb!.gradeId).toBe(newGrade.id);
    expect(examFromDb!.grade).toBeDefined();
    expect(examFromDb!.grade!.id).toBe(newGrade.id);

    const grades = await GradeService.fetchAll();
    const foundGrade = grades.find((grade) => grade.id === newGrade.id);
    expect(foundGrade).toBeDefined();
    expect(foundGrade?.score).toBe(newGradeData.score);
  });

  // Test findById method
  it('should find a grade by id', async () => {
    const grade = await GradeService.findById(testData.grade.id);
    expect(grade).toBeInstanceOf(Grade);
    expect(grade?.id).toBe(testData.grade.id);
    expect(grade?.score).toBe(testData.grade.score);
    expect(grade?.exam).toBeDefined();
  });

  // Test findBySubjectId method
  it('should find grades by subject id', async () => {
    const gradeData: AddExamAndGradePayload = {
      subjectId: testData.subject.id,
      examName: 'Subject ID Test Exam',
      date: new Date(),
      score: 88,
      weight: 1.2,
      comment: 'Subject-specific test',
    };

    const createdGrade = await GradeService.addWithExam(gradeData);

    const foundGrades = await GradeService.findBySubjectId(testData.subject.id);

    expect(Array.isArray(foundGrades)).toBe(true);
    expect(foundGrades.length).toBeGreaterThan(0);

    const match = foundGrades.find((g) => g.id === createdGrade.id);
    expect(match).toBeDefined();
    expect(match?.score).toBe(88);
    expect(match?.weight).toBe(1.2);
    expect(match?.exam).toBeDefined();
    expect(match?.exam.subjectId).toBe(testData.subject.id);
  });

  // Test findByExamId method
  it('should find grades by exam id', async () => {
    const grades = await GradeService.findByExamId(testData.exam.id);
    expect(grades).toBeInstanceOf(Array);
    expect(grades.length).toBeGreaterThan(0);
    expect(grades[0]).toBeInstanceOf(Grade);
    expect(grades[0].exam.id).toBe(testData.exam.id);
  });

  it('should update a grade and maintain bidirectional relationship', async () => {
    const gradeData: AddExamAndGradePayload = {
      subjectId: testData.subject.id,
      examName: 'Update Test Exam',
      date: new Date(),
      score: 75,
      weight: 1.0,
      comment: 'Original comment',
    };

    const originalGrade = await GradeService.addWithExam(gradeData);
    const originalExamId = originalGrade.exam.id;

    const updatedGradeData = {
      ...originalGrade,
      score: 95,
      comment: 'Updated Test Comment',
    };

    const updatedGrade = await GradeService.update(updatedGradeData);
    expect(updatedGrade).toBeInstanceOf(Grade);
    expect(updatedGrade.id).toBe(originalGrade.id);
    expect(updatedGrade.score).toBe(updatedGradeData.score);
    expect(updatedGrade.comment).toBe(updatedGradeData.comment);

    expect(updatedGrade.exam.id).toBe(originalExamId);

    const dataSourceModule = await import('@/db/data-source');
    const { exam: examRepo } = dataSourceModule.getRepositories();
    const examAfterUpdate = await examRepo.findOne({
      where: { id: originalExamId },
    });

    expect(examAfterUpdate!.gradeId).toBe(updatedGrade.id);

    const grade = await GradeService.findById(originalGrade.id);
    expect(grade?.score).toBe(updatedGradeData.score);
    expect(grade?.comment).toBe(updatedGradeData.comment);
  });

  it('should delete a grade and handle exam gradeId correctly', async () => {
    const newGradeData: AddExamAndGradePayload = {
      subjectId: testData.subject.id,
      examName: 'Delete Test Exam with Grade',
      date: new Date(),
      score: 75,
      weight: 1.0,
      comment: 'Delete Comment',
    };
    const newGrade = await GradeService.addWithExam(newGradeData);
    const examId = newGrade.exam.id;

    // Delete the grade
    const deletedGradeId = await GradeService.delete(newGrade.id);
    expect(deletedGradeId).toBe(newGrade.id);

    // Verify the grade was actually deleted from the database
    const grade = await GradeService.findById(newGrade.id);
    expect(grade).toBeNull();

    const dataSourceModule = await import('@/db/data-source');
    const { exam: examRepo } = dataSourceModule.getRepositories();
    const examAfterDelete = await examRepo.findOne({
      where: { id: examId },
      relations: ['grade'],
    });

    expect(examAfterDelete).toBeDefined();
    expect(examAfterDelete!.gradeId).toBeNull();
    expect(examAfterDelete!.grade).toBeNull();
  });

  it('should throw an error when deleting a non-existent grade', async () => {
    await expect(GradeService.delete('non-existent-id')).rejects.toThrow();
  });

  it('should handle exam without grade correctly', async () => {
    const dataSourceModule = await import('@/db/data-source');
    const { exam: examRepo } = dataSourceModule.getRepositories();

    const standaloneExam = examRepo.create({
      name: 'Standalone Exam',
      date: new Date(),
      subjectId: testData.subject.id,
      isCompleted: false,
      gradeId: null,
    });

    const savedExam = await examRepo.save(standaloneExam);

    expect(savedExam.gradeId).toBeNull();

    const gradesForExam = await GradeService.findByExamId(savedExam.id);
    expect(gradesForExam).toHaveLength(0);
  });

  it('should update both exam and grade while maintaining bidirectional relationship', async () => {
    const gradeData: AddExamAndGradePayload = {
      subjectId: testData.subject.id,
      examName: 'Original Exam Name',
      date: new Date(),
      score: 80,
      weight: 1.0,
      comment: 'Original comment',
    };

    const originalGrade = await GradeService.addWithExam(gradeData);

    const updatedExamData = {
      ...originalGrade.exam,
      name: 'Updated Exam Name',
      description: 'Updated description',
    };

    const updatedGradeData = {
      ...originalGrade,
      score: 92,
      comment: 'Updated grade comment',
    };

    const updatedGrade = await GradeService.updateExamAndGrade(
      updatedExamData,
      updatedGradeData,
    );

    expect(updatedGrade.score).toBe(92);
    expect(updatedGrade.comment).toBe('Updated grade comment');

    expect(updatedGrade.exam.name).toBe('Updated Exam Name');
    expect(updatedGrade.exam.description).toBe('Updated description');

    expect(updatedGrade.exam.gradeId).toBe(updatedGrade.id);

    const dataSourceModule = await import('@/db/data-source');
    const { exam: examRepo } = dataSourceModule.getRepositories();
    const examFromDb = await examRepo.findOne({
      where: { id: updatedGrade.exam.id },
    });

    expect(examFromDb!.gradeId).toBe(updatedGrade.id);
    expect(examFromDb!.name).toBe('Updated Exam Name');
  });

  it('should handle multiple grades for different exams', async () => {
    // Add multiple grades for the same subject
    const gradeData1: AddExamAndGradePayload = {
      subjectId: testData.subject.id,
      examName: 'Math Exam 1',
      date: new Date(),
      score: 80,
      weight: 1.0,
    };

    const gradeData2: AddExamAndGradePayload = {
      subjectId: testData.subject.id,
      examName: 'Math Exam 2',
      date: new Date(),
      score: 90,
      weight: 2.0,
    };

    const grade1 = await GradeService.addWithExam(gradeData1);
    const grade2 = await GradeService.addWithExam(gradeData2);

    expect(grade1.exam.gradeId).toBe(grade1.id);
    expect(grade2.exam.gradeId).toBe(grade2.id);

    const allGrades = await GradeService.fetchAll();
    expect(allGrades.length).toBeGreaterThan(2);

    // Calculate weighted average (just as an example of a more complex test)
    const mathGrades = allGrades.filter(
      (grade) => grade.exam && grade.exam.name.includes('Math Exam'),
    );

    expect(mathGrades.length).toBe(2);

    // Verify we can calculate a weighted average
    const totalWeightedScore = mathGrades.reduce(
      (sum, grade) => sum + grade.score * grade.weight,
      0,
    );

    const totalWeight = mathGrades.reduce(
      (sum, grade) => sum + grade.weight,
      0,
    );

    const weightedAverage = totalWeightedScore / totalWeight;

    // With scores 80 (weight 1) and 90 (weight 2), weighted average should be 86.67
    expect(weightedAverage).toBeCloseTo(86.67, 1);
  });
});
