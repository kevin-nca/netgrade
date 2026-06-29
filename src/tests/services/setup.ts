import { DataSource, DataSourceOptions } from 'typeorm';
import { ENTITIES } from '@/db/data-source';
import { Exam, Grade, School, Subject, Semester } from '@/db/entities';
// @ts-expect-error SQL.js is not typed
import initSqlJs from 'sql.js';
import { AppInfo } from '@/AppInfo';
import { beforeAll } from 'vitest';

beforeAll(async () => {
  await AppInfo.initialize();
});

// Initialize a test database using SQL.js in memory
export const initializeTestDatabase = async (): Promise<DataSource> => {
  console.log('Initializing Test SQL.js DB Connection...');

  // Initialize sql.js
  // Make SQL.js available globally for TypeORM
  (window as unknown as { SQL: unknown }).SQL = await initSqlJs({
    locateFile: (file: string) => `./node_modules/sql.js/dist/${file}`,
  });

  const options: DataSourceOptions = {
    type: 'sqljs',
    entities: ENTITIES,
    synchronize: true,
    logging: false, // Disable logging for tests
    dropSchema: true, // Always start with a fresh schema for tests
  };

  const dataSource = new DataSource(options);
  await dataSource.initialize();
  console.log('Test Data Source has been initialized successfully.');

  return dataSource;
};

// Helper function to get repositories for tests
export const getTestRepositories = (dataSource: DataSource) => {
  return {
    exam: dataSource.getRepository(Exam),
    grade: dataSource.getRepository(Grade),
    school: dataSource.getRepository(School),
    subject: dataSource.getRepository(Subject),
    semester: dataSource.getRepository(Semester),
  };
};

// Helper function to seed test data
export const seedTestData = async (dataSource: DataSource) => {
  const repositories = getTestRepositories(dataSource);

  // Create a school
  const school = repositories.school.create({
    name: 'Test School',
    type: 'High School',
    address: '123 Test Street',
  });
  await repositories.school.save(school);

  // Create a semester
  const semester = repositories.semester.create({
    name: '2024/2025',
    startDate: new Date('2024-08-15'),
    endDate: new Date('2025-07-31'),
    schoolId: school.id,
  });
  await repositories.semester.save(semester);

  // Create a subject
  const subject = repositories.subject.create({
    name: 'Test Subject',
    teacher: 'Test Teacher',
    weight: 1.0,
    semesterId: semester.id,
  });
  await repositories.subject.save(subject);

  // Create an exam
  const exam = repositories.exam.create({
    name: 'Test Exam',
    date: new Date(),
    description: 'Test Description',
    weight: 1.0,
    isCompleted: false,
    subjectId: subject.id,
  });
  await repositories.exam.save(exam);

  // Create a grade
  const grade = repositories.grade.create({
    score: 85,
    weight: 1.0,
    comment: 'Test Comment',
    date: new Date(),
    exam: exam,
  });
  await repositories.grade.save(grade);

  return { school, semester, subject, exam, grade };
};

// ========== Mock Subjects for Subject Average Tests ==========

// Helper function to create mock subject with grades
export const createMockSubjectWithGrades = (): Subject => {
  return {
    id: 'test-subject-id',
    name: 'Test Subject',
    exams: [
      {
        id: 'exam1',
        grade: {
          id: 'grade1',
          score: 5.0,
          weight: 1.0,
        } as Grade,
      } as Exam,
      {
        id: 'exam2',
        grade: {
          id: 'grade2',
          score: 4.0,
          weight: 2.0,
        } as Grade,
      } as Exam,
      {
        id: 'exam3',
        grade: {
          id: 'grade3',
          score: 6.0,
          weight: 1.0,
        } as Grade,
      } as Exam,
    ],
  } as Subject;
};

// Helper function to create mock subject with no grades
export const createMockSubjectWithNoGrades = (): Subject => {
  return {
    id: 'test-subject-id',
    name: 'Test Subject',
    exams: [
      {
        id: 'exam1',
        grade: null,
      } as Exam,
      {
        id: 'exam2',
        grade: null,
      } as Exam,
    ],
  } as Subject;
};

// Helper function to create mock subject with different weights
export const createMockSubjectWithDifferentWeights = (): Subject => {
  return {
    id: 'test-subject-id',
    name: 'Test Subject',
    exams: [
      {
        id: 'exam1',
        grade: {
          id: 'grade1',
          score: 6.0,
          weight: 3.0,
        } as Grade,
      } as Exam,
      {
        id: 'exam2',
        grade: {
          id: 'grade2',
          score: 4.0,
          weight: 1.0,
        } as Grade,
      } as Exam,
    ],
  } as Subject;
};

// Helper function to create mock subject with zero weight
export const createMockSubjectWithZeroWeight = (): Subject => {
  return {
    id: 'test-subject-id',
    name: 'Test Subject',
    exams: [
      {
        id: 'exam1',
        grade: {
          id: 'grade1',
          score: 5.0,
          weight: 0,
        } as Grade,
      } as Exam,
    ],
  } as Subject;
};

// Helper function to create mock subject with missing grade
export const createMockSubjectWithMissingGrade = (): Subject => {
  return {
    id: 'test-subject-id',
    name: 'Test Subject',
    exams: [
      {
        id: 'exam1',
        grade: {
          id: 'grade1',
          score: 5.0,
          weight: 1.0,
        } as Grade,
      } as Exam,
      {
        id: 'exam2',
        grade: null,
      } as Exam,
    ],
  } as Subject;
};

// ========== Mock Schools for School Average Tests ==========

// Helper function to create mock school with subjects that have grades
export const createMockSchoolWithSubjects = (): School => {
  return {
    id: 'test-school-id',
    name: 'Test School',
    semesters: [
      {
        id: 'semester1',
        subjects: [
          {
            id: 'subject1',
            name: 'Math',
            exams: [
              {
                id: 'exam1',
                grade: { id: 'grade1', score: 5.0, weight: 1.0 } as Grade,
              } as Exam,
            ],
          } as Subject,
          {
            id: 'subject2',
            name: 'English',
            exams: [
              {
                id: 'exam2',
                grade: { id: 'grade2', score: 4.0, weight: 1.0 } as Grade,
              } as Exam,
              {
                id: 'exam3',
                grade: { id: 'grade3', score: 5.0, weight: 1.0 } as Grade,
              } as Exam,
            ],
          } as Subject,
          {
            id: 'subject3',
            name: 'Science',
            exams: [
              {
                id: 'exam4',
                grade: { id: 'grade4', score: 5.0, weight: 1.0 } as Grade,
              } as Exam,
            ],
          } as Subject,
        ],
      } as Semester,
    ],
  } as School;
};

// Helper function to create mock school with mixed subjects (some with grades, some without)
export const createMockSchoolWithMixedSubjects = (): School => {
  return {
    id: 'test-school-id',
    name: 'Test School',
    semesters: [
      {
        id: 'semester1',
        subjects: [
          {
            id: 'subject1',
            name: 'Math',
            exams: [
              {
                id: 'exam1',
                grade: { id: 'grade1', score: 5.0, weight: 1.0 } as Grade,
              } as Exam,
            ],
          } as Subject,
          {
            id: 'subject2',
            name: 'English',
            exams: [
              {
                id: 'exam2',
                grade: null, // No grade
              } as Exam,
            ],
          } as Subject,
          {
            id: 'subject3',
            name: 'Science',
            exams: [
              {
                id: 'exam3',
                grade: { id: 'grade3', score: 6.0, weight: 1.0 } as Grade,
              } as Exam,
            ],
          } as Subject,
        ],
      } as Semester,
    ],
  } as School;
};

// Helper function to create mock school with different subject averages
export const createMockSchoolWithDifferentSubjectAverages = (): School => {
  return {
    id: 'test-school-id',
    name: 'Test School',
    semesters: [
      {
        id: 'semester1',
        subjects: [
          {
            id: 'subject1',
            name: 'Math',
            exams: [
              {
                id: 'exam1',
                grade: { id: 'grade1', score: 6.0, weight: 3.0 } as Grade,
              } as Exam,
              {
                id: 'exam2',
                grade: { id: 'grade2', score: 4.0, weight: 1.0 } as Grade,
              } as Exam,
            ],
          } as Subject,
          {
            id: 'subject2',
            name: 'English',
            exams: [
              {
                id: 'exam3',
                grade: { id: 'grade3', score: 5.0, weight: 1.0 } as Grade,
              } as Exam,
            ],
          } as Subject,
        ],
      } as Semester,
    ],
  } as School;
};

// ========== Mock Exams for Widget Tests ==========

export const createMockWidgetExams = (): Partial<Exam>[] => [
  {
    id: 'exam-1',
    name: 'Mathematik Klausur',
    subject: { name: 'Mathematik' } as Subject,
    date: new Date('2026-06-10T10:00:00.000Z'),
  },
  {
    id: 'exam-2',
    name: 'Physik Test',
    subject: { name: 'Physik' } as Subject,
    date: new Date('2026-06-15T14:00:00.000Z'),
  },
];

export const createMockWidgetExamsOverLimit = (): Partial<Exam>[] => [
  {
    id: 'exam-1',
    name: 'Exam 1',
    subject: { name: 'Subject 1' } as Subject,
    date: new Date('2026-06-10T00:00:00.000Z'),
  },
  {
    id: 'exam-2',
    name: 'Exam 2',
    subject: { name: 'Subject 2' } as Subject,
    date: new Date('2026-06-11T00:00:00.000Z'),
  },
  {
    id: 'exam-3',
    name: 'Exam 3',
    subject: { name: 'Subject 3' } as Subject,
    date: new Date('2026-06-12T00:00:00.000Z'),
  },
  {
    id: 'exam-4',
    name: 'Exam 4',
    subject: { name: 'Subject 4' } as Subject,
    date: new Date('2026-06-13T00:00:00.000Z'),
  },
];

export const createMockWidgetExamWithoutSubject = (): Partial<Exam>[] => [
  {
    id: 'exam-1',
    name: 'Exam without subject',
    subject: null as unknown as Subject,
    date: new Date('2026-06-10T00:00:00.000Z'),
  },
];

// ========== Mock Semester for Semester Tests ==========

// Helper function to create mock current semester
export const createMockCurrentSemester = (): Semester => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1); // Jan 1 dieses Jahr
  const endOfYear = new Date(today.getFullYear(), 11, 31); // Dec 31 dieses Jahr

  return {
    id: 'semester-1',
    name: 'Current Semester',
    startDate: startOfYear,
    endDate: endOfYear,
  } as Semester;
};

// Helper function to clean up test data
export const cleanupTestData = async (dataSource: DataSource) => {
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
};
