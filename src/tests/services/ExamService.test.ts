import { describe, it, vi, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import { ExamService } from '@/services/ExamService';
import { initializeTestDatabase, cleanupTestData, seedTestData } from './setup';
import { Exam } from '@/db/entities/Exam';
import { Grade, School, Semester, Subject } from '@/db/entities';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn().mockReturnValue(false),
    convertFileSrc: vi.fn((uri: string) => `capacitor://localhost/${uri}`),
  },
}));

vi.mock('@capacitor/camera', () => ({
  Camera: { getPhoto: vi.fn() },
  CameraResultType: { Uri: 'uri', Base64: 'base64' },
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    writeFile: vi.fn().mockResolvedValue({}),
    readFile: vi.fn().mockResolvedValue({ data: 'base64data' }),
    getUri: vi.fn().mockResolvedValue({ uri: 'file://data/photos/test.jpg' }),
    copy: vi.fn().mockResolvedValue({}),
  },
  Directory: { Data: 'DATA', Documents: 'DOCUMENTS' },
}));

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

  it('should throw if add exam fails', async () => {
    const examRepo = dataSource.getRepository(Exam);
    vi.spyOn(examRepo, 'save').mockRejectedValueOnce(new Error('DB error'));

    await expect(
      ExamService.add({
        schoolId: testData.school.id,
        subjectId: testData.subject.id,
        title: 'Fail Exam',
        date: new Date(),
      }),
    ).rejects.toThrow('DB error');
  });

  it('should fetch upcoming exams regardless of grade status', async () => {
    const exams = await ExamService.fetchUpcoming();
    expect(exams).toBeInstanceOf(Array);
  });

  describe('takeExamPhoto', () => {
    it('should save photo via writeFile on web and return path', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
      vi.mocked(Camera.getPhoto).mockResolvedValue({
        base64String: 'abc123',
        format: 'jpeg',
        saved: false,
      });

      const path = await ExamService.takeExamPhoto();

      expect(path).toMatch(/^photos\/.+\.jpg$/);
      expect(Filesystem.writeFile).toHaveBeenCalledWith(
        expect.objectContaining({
          data: 'abc123',
          directory: Directory.Data,
          recursive: true,
        }),
      );
      expect(Camera.getPhoto).toHaveBeenCalledWith(
        expect.objectContaining({ resultType: CameraResultType.Base64 }),
      );
    });

    it('should copy photo via Filesystem.copy on native and return path', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Camera.getPhoto).mockResolvedValue({
        path: '/tmp/photo.jpg',
        format: 'jpeg',
        saved: false,
      });

      const path = await ExamService.takeExamPhoto();

      expect(path).toMatch(/^photos\/.+\.jpg$/);
      expect(Filesystem.copy).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '/tmp/photo.jpg',
          toDirectory: Directory.Data,
        }),
      );
      expect(Camera.getPhoto).toHaveBeenCalledWith(
        expect.objectContaining({ resultType: CameraResultType.Uri }),
      );

      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    });

    it('should throw if Camera.getPhoto fails', async () => {
      vi.mocked(Camera.getPhoto).mockRejectedValue(new Error('Camera denied'));
      await expect(ExamService.takeExamPhoto()).rejects.toThrow(
        'Camera denied',
      );
    });
  });

  describe('resolvePhotoSrc', () => {
    it('should return base64 data URI on web', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
      vi.mocked(Filesystem.readFile).mockResolvedValue({ data: 'base64data' });

      const src = await ExamService.resolvePhotoSrc('photos/test.jpg');

      expect(src).toBe('data:image/jpeg;base64,base64data');
      expect(Filesystem.readFile).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'photos/test.jpg',
          directory: Directory.Data,
        }),
      );
    });

    it('should return convertFileSrc URI on native', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: 'file://data/photos/test.jpg',
      });
      vi.mocked(Capacitor.convertFileSrc).mockReturnValue(
        'capacitor://localhost/photos/test.jpg',
      );

      const src = await ExamService.resolvePhotoSrc('photos/test.jpg');

      expect(src).toBe('capacitor://localhost/photos/test.jpg');
      expect(Filesystem.getUri).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'photos/test.jpg',
          directory: Directory.Data,
        }),
      );

      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    });
  });
});
