import { describe, it, vi, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import { SchoolService } from '@/services/SchoolService';
import { initializeTestDatabase, cleanupTestData, seedTestData } from './setup';
import { School } from '@/db/entities/School';
import { Exam, Grade, Subject } from '@/db/entities';

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
});
