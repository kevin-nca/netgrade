import { DataSource, DataSourceOptions } from 'typeorm';
import { ENTITIES } from '@/db/data-source';
import { Exam, Grade, School, Subject } from '@/db/entities';
// @ts-expect-error SQL.js is not typed
import initSqlJs from 'sql.js';
import { AppInfo } from '@/AppInfo';

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

  // Create a subject
  const subject = repositories.subject.create({
    name: 'Test Subject',
    teacher: 'Test Teacher',
    description: 'Test Description',
    weight: 1.0,
    schoolId: school.id,
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

  return { school, subject, exam, grade };
};

// Helper function to clean up test data
export const cleanupTestData = async (dataSource: DataSource) => {
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
};
