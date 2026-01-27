import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { DataSource } from 'typeorm';
import { SubjectService } from '@/services/SubjectService';
import { cleanupTestData, initializeTestDatabase, seedTestData } from './setup';
import { Subject } from '@/db/entities/Subject';
import { Exam, Grade, School } from '@/db/entities';
import { Semester } from '../../db/entities/Semester';

describe('SubjectService', () => {
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
  it('should fetch all subjects', async () => {
    const subjects = await SubjectService.fetchAll();
    expect(subjects).toBeInstanceOf(Array);
    expect(subjects.length).toBeGreaterThan(0);
    expect(subjects[0]).toBeInstanceOf(Subject);
    expect(subjects[0].name).toBe('Test Subject');
  });

  // Test add method
  it('should add a new subject', async () => {
    const newSubjectData = {
      name: 'New Test Subject',
      schoolId: testData.school.id,
      teacher: 'New Test Teacher',
      weight: 1.5,
    };

    const newSubject = await SubjectService.add(newSubjectData);
    expect(newSubject).toBeInstanceOf(Subject);
    expect(newSubject.id).toBeDefined();
    expect(newSubject.name).toBe(newSubjectData.name);
    expect(newSubject.teacher).toBe(newSubjectData.teacher);
    expect(newSubject.weight).toBe(newSubjectData.weight);
    expect(newSubject.schoolId).toBe(newSubjectData.schoolId);

    // Verify the subject was actually added to the database
    const subjects = await SubjectService.fetchAll();
    const foundSubject = subjects.find(
      (subject) => subject.id === newSubject.id,
    );
    expect(foundSubject).toBeDefined();
    expect(foundSubject?.name).toBe(newSubjectData.name);
  });

  // Test findById method
  it('should find a subject by id', async () => {
    const subject = await SubjectService.findById(testData.subject.id);
    expect(subject).toBeInstanceOf(Subject);
    expect(subject?.id).toBe(testData.subject.id);
    expect(subject?.name).toBe(testData.subject.name);
  });

  // Test findBySchoolId method
  it('should find subjects by school id', async () => {
    const subjects = await SubjectService.findBySchoolId(testData.school.id);
    expect(subjects).toBeInstanceOf(Array);
    expect(subjects.length).toBeGreaterThan(0);
    expect(subjects[0]).toBeInstanceOf(Subject);
    expect(subjects[0].schoolId).toBe(testData.school.id);
  });

  // Test update method
  it('should update a subject', async () => {
    const updatedSubjectData = {
      ...testData.subject,
      name: 'Updated Test Subject',
      teacher: 'Updated Test Teacher',
    };

    const updatedSubject = await SubjectService.update(updatedSubjectData);
    expect(updatedSubject).toBeInstanceOf(Subject);
    expect(updatedSubject.id).toBe(testData.subject.id);
    expect(updatedSubject.name).toBe(updatedSubjectData.name);
    expect(updatedSubject.teacher).toBe(updatedSubjectData.teacher);

    // Verify the subject was actually updated in the database
    const subject = await SubjectService.findById(testData.subject.id);
    expect(subject?.name).toBe(updatedSubjectData.name);
    expect(subject?.teacher).toBe(updatedSubjectData.teacher);
  });

  // Test delete method
  it('should delete a subject', async () => {
    // First, add a new subject to delete
    const newSubjectData = {
      name: 'Subject to Delete',
      schoolId: testData.school.id,
      teacher: 'Delete Teacher',
    };
    const newSubject = await SubjectService.add(newSubjectData);

    // Delete the subject
    const deletedSubjectId = await SubjectService.delete(newSubject.id);
    expect(deletedSubjectId).toBe(newSubject.id);

    // Verify the subject was actually deleted from the database
    const subject = await SubjectService.findById(newSubject.id);
    expect(subject).toBeNull();
  });

  // Test error handling for delete method
  it('should throw an error when deleting a non-existent subject', async () => {
    await expect(SubjectService.delete('non-existent-id')).rejects.toThrow();
  });

  // Test getOrCreateDefaultSemester - creates default semester if none exists
  it('should create a default semester when adding a subject without semesterId', async () => {
    const semesterRepo = dataSource.getRepository(Semester);

    // Ensure no default semester exists
    const defaultSemesterId = 'default-semester-id';
    await semesterRepo.delete(defaultSemesterId);

    const newSubjectData = {
      name: 'Subject Without Semester',
      schoolId: testData.school.id,
      teacher: 'Test Teacher',
      weight: 1.0,
      // No semesterId provided
    };

    const newSubject = await SubjectService.add(newSubjectData);

    expect(newSubject).toBeInstanceOf(Subject);
    expect(newSubject.semesterId).toBeDefined();
    expect(newSubject.semesterId).toBe(defaultSemesterId);

    // Verify the default semester was created
    const defaultSemester = await semesterRepo.findOne({
      where: { id: defaultSemesterId },
    });
    expect(defaultSemester).toBeDefined();
    expect(defaultSemester?.name).toMatch(/\d{4}\/\d{4}/); // Matches format like "2025/2026"
  });

  // Test getOrCreateDefaultSemester - reuses existing default semester
  it('should reuse existing default semester when adding a subject without semesterId', async () => {
    const semesterRepo = dataSource.getRepository(Semester);

    // Get the current count of semesters
    const initialSemesterCount = await semesterRepo.count();

    const newSubjectData = {
      name: 'Another Subject Without Semester',
      schoolId: testData.school.id,
      teacher: 'Test Teacher',
      weight: 1.0,
      // No semesterId provided
    };

    const newSubject = await SubjectService.add(newSubjectData);

    expect(newSubject).toBeInstanceOf(Subject);
    expect(newSubject.semesterId).toBe('default-semester-id');

    // Verify no new semester was created (count should be the same)
    const finalSemesterCount = await semesterRepo.count();
    expect(finalSemesterCount).toBe(initialSemesterCount);
  });
});
