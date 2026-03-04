import { describe, it, vi, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import { SubjectService } from '@/services/SubjectService';
import { initializeTestDatabase, cleanupTestData, seedTestData } from './setup';
import { Exam, Grade, School, Semester, Subject } from '@/db/entities';

describe('SubjectService', () => {
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

  it('should fetch all subjects', async () => {
    const subjects = await SubjectService.fetchAll();
    expect(subjects).toBeInstanceOf(Array);
    expect(subjects.length).toBeGreaterThan(0);
    expect(subjects[0]).toBeInstanceOf(Subject);
    expect(subjects[0].name).toBe('Test Subject');
  });

  it('should add a new subject', async () => {
    const newSubjectData = {
      name: 'New Test Subject',
      semesterId: testData.semester.id,
      teacher: 'New Test Teacher',
      weight: 1.5,
    };

    const newSubject = await SubjectService.add(newSubjectData);
    expect(newSubject).toBeInstanceOf(Subject);
    expect(newSubject.id).toBeDefined();
    expect(newSubject.name).toBe(newSubjectData.name);
    expect(newSubject.teacher).toBe(newSubjectData.teacher);
    expect(newSubject.weight).toBe(newSubjectData.weight);
    expect(newSubject.semesterId).toBe(newSubjectData.semesterId);

    const subjects = await SubjectService.fetchAll();
    const foundSubject = subjects.find(
      (subject) => subject.id === newSubject.id,
    );
    expect(foundSubject).toBeDefined();
    expect(foundSubject?.name).toBe(newSubjectData.name);
  });

  it('should find a subject by id', async () => {
    const subject = await SubjectService.findById(testData.subject.id);
    expect(subject).toBeInstanceOf(Subject);
    expect(subject?.id).toBe(testData.subject.id);
    expect(subject?.name).toBe(testData.subject.name);
  });

  it('should find subjects by school id', async () => {
    const subjects = await SubjectService.findBySchoolId(testData.school.id);
    expect(subjects).toBeInstanceOf(Array);
    expect(subjects.length).toBeGreaterThan(0);
    expect(subjects[0]).toBeInstanceOf(Subject);
    // Subject is linked to school via semester
    expect(subjects[0].semester.schoolId).toBe(testData.school.id);
  });

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

    const subject = await SubjectService.findById(testData.subject.id);
    expect(subject?.name).toBe(updatedSubjectData.name);
    expect(subject?.teacher).toBe(updatedSubjectData.teacher);
  });

  it('should delete a subject', async () => {
    const newSubjectData = {
      name: 'Subject to Delete',
      semesterId: testData.semester.id,
      teacher: 'Delete Teacher',
    };
    const newSubject = await SubjectService.add(newSubjectData);

    const deletedSubjectId = await SubjectService.delete(newSubject.id);
    expect(deletedSubjectId).toBe(newSubject.id);

    const subject = await SubjectService.findById(newSubject.id);
    expect(subject).toBeNull();
  });

  it('should throw an error when deleting a non-existent subject', async () => {
    await expect(SubjectService.delete('non-existent-id')).rejects.toThrow();
  });
});
