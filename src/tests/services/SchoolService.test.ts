import { describe, it, vi, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import { SchoolService } from '@/services/SchoolService';
import {
  initializeTestDatabase,
  cleanupTestData,
  seedTestData,
  createMockSchoolWithSubjects,
  createMockSchoolWithMixedSubjects,
  createMockSchoolWithDifferentSubjectAverages,
  createMockSubjectWithGrades,
  createMockSubjectWithNoGrades,
  createMockSubjectWithDifferentWeights,
  createMockSubjectWithZeroWeight,
  createMockSubjectWithMissingGrade,
} from './setup';
import { School } from '@/db/entities/School';
import { Exam, Grade, Semester, Subject } from '@/db/entities';

describe('SchoolService', () => {
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
  it('should fetch all schools', async () => {
    const schools = await SchoolService.fetchAll();
    expect(schools).toBeInstanceOf(Array);
    expect(schools.length).toBeGreaterThan(0);
    expect(schools[0]).toBeInstanceOf(School);
    expect(schools[0].name).toBe('Test School');
  });

  // Test add method
  it('should add a new school', async () => {
    const newSchoolData = {
      name: 'New Test School',
      type: 'Elementary School',
      address: '456 New Test Street',
    };

    const newSchool = await SchoolService.add(newSchoolData);
    expect(newSchool).toBeInstanceOf(School);
    expect(newSchool.id).toBeDefined();
    expect(newSchool.name).toBe(newSchoolData.name);
    expect(newSchool.type).toBe(newSchoolData.type);
    expect(newSchool.address).toBe(newSchoolData.address);
    // Verify default semester was created
    expect(newSchool.semesters).toBeDefined();
    expect(newSchool.semesters.length).toBe(1);

    // Verify the school was actually added to the database
    const schools = await SchoolService.fetchAll();
    const foundSchool = schools.find((school) => school.id === newSchool.id);
    expect(foundSchool).toBeDefined();
    expect(foundSchool?.name).toBe(newSchoolData.name);
  });

  // Test findById method
  it('should find a school by id', async () => {
    const school = await SchoolService.findById(testData.school.id);
    expect(school).toBeInstanceOf(School);
    expect(school?.id).toBe(testData.school.id);
    expect(school?.name).toBe(testData.school.name);
  });

  // Test update method
  it('should update a school', async () => {
    const updatedSchoolData = {
      ...testData.school,
      name: 'Updated Test School',
      type: 'Updated School Type',
    };

    const updatedSchool = await SchoolService.update(updatedSchoolData);
    expect(updatedSchool).toBeInstanceOf(School);
    expect(updatedSchool.id).toBe(testData.school.id);
    expect(updatedSchool.name).toBe(updatedSchoolData.name);
    expect(updatedSchool.type).toBe(updatedSchoolData.type);

    // Verify the school was actually updated in the database
    const school = await SchoolService.findById(testData.school.id);
    expect(school?.name).toBe(updatedSchoolData.name);
    expect(school?.type).toBe(updatedSchoolData.type);
  });

  // Test delete method
  it('should delete a school', async () => {
    // First, add a new school to delete
    const newSchoolData = {
      name: 'School to Delete',
      type: 'School Type',
      address: '789 Delete Street',
    };
    const newSchool = await SchoolService.add(newSchoolData);

    // Delete the school
    const deletedSchoolId = await SchoolService.delete(newSchool.id);
    expect(deletedSchoolId).toBe(newSchool.id);

    // Verify the school was actually deleted from the database
    const school = await SchoolService.findById(newSchool.id);
    expect(school).toBeNull();
  });

  // Test error handling for delete method
  it('should throw an error when deleting a non-existent school', async () => {
    await expect(SchoolService.delete('non-existent-id')).rejects.toThrow();
  });

  // Cascade delete regression tests.
  describe('cascade delete', () => {
    let repos: {
      school: ReturnType<typeof dataSource.getRepository<School>>;
      semester: ReturnType<typeof dataSource.getRepository<Semester>>;
      subject: ReturnType<typeof dataSource.getRepository<Subject>>;
      exam: ReturnType<typeof dataSource.getRepository<Exam>>;
      grade: ReturnType<typeof dataSource.getRepository<Grade>>;
    };

    beforeAll(() => {
      repos = {
        school: dataSource.getRepository(School),
        semester: dataSource.getRepository(Semester),
        subject: dataSource.getRepository(Subject),
        exam: dataSource.getRepository(Exam),
        grade: dataSource.getRepository(Grade),
      };
    });

    const createFullHierarchy = async () => {
      const school = repos.school.create({ name: 'Cascade Test School' });
      await repos.school.save(school);

      const semester = repos.semester.create({
        name: 'Cascade Semester',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        schoolId: school.id,
      });
      await repos.semester.save(semester);

      const subject = repos.subject.create({
        name: 'Cascade Subject',
        weight: 1.0,
        semesterId: semester.id,
      });
      await repos.subject.save(subject);

      const exam = repos.exam.create({
        name: 'Cascade Exam',
        date: new Date(),
        weight: 1.0,
        isCompleted: false,
        subjectId: subject.id,
      });
      await repos.exam.save(exam);

      const grade = repos.grade.create({
        score: 5.0,
        weight: 1.0,
        date: new Date(),
        exam: exam,
      });
      await repos.grade.save(grade);

      return { school, semester, subject, exam, grade };
    };

    // all cascade failures below.
    it('should have PRAGMA foreign_keys = ON (required for cascade to work)', async () => {
      const result = await dataSource.query('PRAGMA foreign_keys');

      expect(result[0].foreign_keys).toBe(1);
    });

    // Step 1: school → semester  (FK: semester.schoolId → school.id ON DELETE CASCADE)
    it('should delete semesters when their school is deleted', async () => {
      const { school, semester } = await createFullHierarchy();
      await SchoolService.delete(school.id);
      expect(await repos.semester.findOneBy({ id: semester.id })).toBeNull();
    });

    // Step 2: semester → subject  (FK: subject.semesterId → semester.id ON DELETE CASCADE)
    it('should delete subjects when their school is deleted', async () => {
      const { school, subject } = await createFullHierarchy();
      await SchoolService.delete(school.id);
      expect(await repos.subject.findOneBy({ id: subject.id })).toBeNull();
    });

    // Step 3: subject → exam  (FK: exam.subjectId → subject.id ON DELETE CASCADE)
    it('should delete exams when their school is deleted', async () => {
      const { school, exam } = await createFullHierarchy();
      await SchoolService.delete(school.id);
      expect(await repos.exam.findOneBy({ id: exam.id })).toBeNull();
    });
  });

  // Test calculateSchoolAverage method
  describe('calculateSchoolAverage', () => {
    it('should calculate the weighted average for a school with grades', () => {
      const mockSchool = createMockSchoolWithSubjects();

      const average = SchoolService.calculateSchoolAverage(mockSchool);
      expect(average).toBe(4.8);
    });

    it('should only include grades from the specified school', () => {
      const mockSchool = createMockSchoolWithMixedSubjects();

      const average = SchoolService.calculateSchoolAverage(mockSchool);
      expect(average).toBe(5.5);
    });

    it('should handle grades with different weights correctly', () => {
      const mockSchool = createMockSchoolWithDifferentSubjectAverages();

      const average = SchoolService.calculateSchoolAverage(mockSchool);
      expect(average).toBe(5.3);
    });

    it('should round average to 1 decimal place', () => {
      const mockSchool = createMockSchoolWithSubjects();

      const average = SchoolService.calculateSchoolAverage(mockSchool);
      // Original calculation: (5.0*1 + 4.0*2 + 6.0*1) / 4 = 4.75
      // Rounded to 1 decimal: 4.8
      expect(average).toBe(4.8);
    });
  });

  // Test calculateSubjectAverage method
  describe('calculateSubjectAverage', () => {
    it('should calculate the weighted average for a subject with grades', () => {
      const mockSubject = createMockSubjectWithGrades();

      const average = SchoolService.calculateSubjectAverage(mockSubject);
      expect(average).toBe(4.75);
    });

    it('should return undefined when no grades belong to the specified subject', () => {
      const mockSubject = createMockSubjectWithNoGrades();

      const average = SchoolService.calculateSubjectAverage(mockSubject);
      expect(average).toBeUndefined();
    });

    it('should only include grades from the specified subject', () => {
      const mockSubject = createMockSubjectWithGrades();

      const average = SchoolService.calculateSubjectAverage(mockSubject);
      expect(average).toBe(4.75);
    });

    it('should handle grades with different weights correctly', () => {
      const mockSubject = createMockSubjectWithDifferentWeights();

      const average = SchoolService.calculateSubjectAverage(mockSubject);
      expect(average).toBe(5.5);
    });

    it('should return undefined when total weight is zero', () => {
      const mockSubject = createMockSubjectWithZeroWeight();

      const average = SchoolService.calculateSubjectAverage(mockSubject);
      expect(average).toBeUndefined();
    });

    it('should handle grades with missing exam relationship gracefully', () => {
      const mockSubject = createMockSubjectWithMissingGrade();

      const average = SchoolService.calculateSubjectAverage(mockSubject);
      expect(average).toBe(5.0);
    });

    it('should round average to 2 decimal places', () => {
      const mockSubject = createMockSubjectWithGrades();

      const average = SchoolService.calculateSubjectAverage(mockSubject);
      // Original calculation: (5.0*1 + 4.0*2 + 6.0*1) / 4 = 4.75
      // Rounded to 2 decimal places: 4.75
      expect(average).toBe(4.75);
    });
  });
});
