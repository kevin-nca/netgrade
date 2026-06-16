import { describe, it, vi, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import { initializeTestDatabase, cleanupTestData, seedTestData } from './setup';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import {
  DocumentScanner,
  ResponseType,
  ScanDocumentResponseStatus,
} from '@capgo/capacitor-document-scanner';
import { Ocr } from '@jcesarmobile/capacitor-ocr';
import { FoundationModels } from '@/plugins/foundationModels';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn().mockReturnValue(false),
    convertFileSrc: vi.fn((uri: string) => `capacitor://localhost/${uri}`),
  },
  registerPlugin: vi.fn(() => ({ generate: vi.fn() })),
}));

vi.mock('@capgo/capacitor-document-scanner', () => ({
  DocumentScanner: { scanDocument: vi.fn() },
  ResponseType: { ImageFilePath: 'imageFilePath', Base64: 'base64' },
  ScanDocumentResponseStatus: { Success: 'success', Cancel: 'cancel' },
}));

vi.mock('@jcesarmobile/capacitor-ocr', () => ({
  Ocr: { process: vi.fn() },
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    writeFile: vi.fn().mockResolvedValue({}),
    readFile: vi.fn().mockResolvedValue({ data: 'base64data' }),
    getUri: vi.fn().mockResolvedValue({ uri: 'file://data/photos/test.jpg' }),
    copy: vi.fn().mockResolvedValue({}),
    deleteFile: vi.fn().mockResolvedValue({}),
  },
  Directory: { Data: 'DATA', Documents: 'DOCUMENTS' },
}));
import {
  Exam,
  ExamScan,
  Grade,
  School,
  Semester,
  Subject,
} from '@/db/entities';
import { ExamService } from '@/services';

describe('ExamService', () => {
  let dataSource: DataSource;
  let testData: Awaited<ReturnType<typeof seedTestData>>;

  // Set up the database before all tests
  beforeAll(async () => {
    // Initialize the test database
    dataSource = await initializeTestDatabase();

    // Mock the getRepositories function to use our test repositories
    const dataSourceModule = await import('@/db/data-source');
    vi.spyOn(dataSourceModule, 'getRepositories').mockReturnValue({
      school: dataSource.getRepository(School),
      semester: dataSource.getRepository(Semester),
      subject: dataSource.getRepository(Subject),
      exam: dataSource.getRepository(Exam),
      grade: dataSource.getRepository(Grade),
    });
    vi.spyOn(dataSourceModule, 'getDataSource').mockReturnValue(dataSource);

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
    it('should save photo via writeFile on web and return paths', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
      vi.mocked(DocumentScanner.scanDocument).mockResolvedValue({
        status: ScanDocumentResponseStatus.Success,
        scannedImages: ['abc123'],
        getPluginVersion: vi.fn(),
      });

      const paths = await ExamService.takeExamPhoto();

      expect(paths).toHaveLength(1);
      expect(paths[0]).toMatch(/^photos\/.+\.jpg$/);
      expect(Filesystem.writeFile).toHaveBeenCalledWith(
        expect.objectContaining({
          data: 'abc123',
          directory: Directory.Data,
          recursive: true,
        }),
      );
      expect(DocumentScanner.scanDocument).toHaveBeenCalledWith(
        expect.objectContaining({ responseType: ResponseType.Base64 }),
      );
    });

    it('should read and write photo on native and return paths', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Filesystem.readFile).mockResolvedValue({ data: 'base64data' });
      vi.mocked(DocumentScanner.scanDocument).mockResolvedValue({
        status: ScanDocumentResponseStatus.Success,
        scannedImages: ['/tmp/photo.jpg'],
        getPluginVersion: vi.fn(),
      });

      const paths = await ExamService.takeExamPhoto();

      expect(paths).toHaveLength(1);
      expect(paths[0]).toMatch(/^photos\/.+\.jpg$/);
      expect(Filesystem.readFile).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/tmp/photo.jpg' }),
      );
      expect(Filesystem.writeFile).toHaveBeenCalledWith(
        expect.objectContaining({
          data: 'base64data',
          directory: Directory.Data,
          recursive: true,
        }),
      );
      expect(DocumentScanner.scanDocument).toHaveBeenCalledWith(
        expect.objectContaining({ responseType: ResponseType.ImageFilePath }),
      );

      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    });

    it('should throw if scanDocument fails', async () => {
      vi.mocked(DocumentScanner.scanDocument).mockResolvedValue({
        status: ScanDocumentResponseStatus.Cancel,
        scannedImages: [],
        getPluginVersion: vi.fn(),
      });
      await expect(ExamService.takeExamPhoto()).rejects.toThrow(
        'Scan abgebrochen oder fehlgeschlagen.',
      );
    });
  });

  describe('addScans', () => {
    it('should create and save ExamScan entities', async () => {
      const paths = ['photos/a.jpg', 'photos/b.jpg'];
      const scans = await ExamService.addScans(testData.exam.id, paths);

      expect(scans).toHaveLength(2);
      expect(scans[0]).toBeInstanceOf(ExamScan);
      expect(scans[0].examId).toBe(testData.exam.id);
      expect(scans[0].photoPath).toBe('photos/a.jpg');
      expect(scans[1].photoPath).toBe('photos/b.jpg');
    });
  });

  describe('deleteScan', () => {
    it('should delete scan and its file from filesystem', async () => {
      const [scan] = await ExamService.addScans(testData.exam.id, [
        'photos/to-delete.jpg',
      ]);

      const result = await ExamService.deleteScan(scan.id);

      expect(result).toBe(scan.id);
      expect(Filesystem.deleteFile).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'photos/to-delete.jpg',
          directory: Directory.Data,
        }),
      );

      const scanRepo = dataSource.getRepository(ExamScan);
      const deleted = await scanRepo.findOneBy({ id: scan.id });
      expect(deleted).toBeNull();
    });

    it('should throw if scan does not exist', async () => {
      await expect(ExamService.deleteScan('non-existent-id')).rejects.toThrow(
        'ExamScan with ID non-existent-id not found.',
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

  describe('extractNoteFromScan', () => {
    it('should return grade from AI response', async () => {
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: 'file://data/photos/test.jpg',
      });
      vi.mocked(Ocr.process).mockResolvedValue({
        results: [
          { text: 'Informatik Note: 5.5 Punkte: 19/20', confidence: 0.99 },
        ],
      });
      vi.mocked(FoundationModels.generate).mockResolvedValue({
        text: 'Note: 5.5\nDatum: 19.03.2026',
      });

      const note = await ExamService.extractNoteFromScan('photos/test.jpg');

      expect(note).toBe(5.5);
    });

    it('should return grade with comma as decimal separator', async () => {
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: 'file://data/photos/test.jpg',
      });
      vi.mocked(Ocr.process).mockResolvedValue({
        results: [{ text: 'Note: 4,5', confidence: 0.99 }],
      });
      vi.mocked(FoundationModels.generate).mockResolvedValue({
        text: 'Note: 4,5',
      });

      const note = await ExamService.extractNoteFromScan('photos/test.jpg');

      expect(note).toBe(4.5);
    });

    it('should return null when AI does not find a grade', async () => {
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: 'file://data/photos/test.jpg',
      });
      vi.mocked(Ocr.process).mockResolvedValue({
        results: [{ text: 'kein relevanter text', confidence: 0.9 }],
      });
      vi.mocked(FoundationModels.generate).mockResolvedValue({
        text: 'Kein Fach erkannt.',
      });

      const note = await ExamService.extractNoteFromScan('photos/test.jpg');

      expect(note).toBeNull();
    });

    it('should return null when AI throws an error', async () => {
      vi.mocked(Filesystem.getUri).mockResolvedValue({
        uri: 'file://data/photos/test.jpg',
      });
      vi.mocked(Ocr.process).mockResolvedValue({
        results: [{ text: 'Note: 5', confidence: 0.9 }],
      });
      vi.mocked(FoundationModels.generate).mockRejectedValue(
        new Error('Model not ready'),
      );

      const note = await ExamService.extractNoteFromScan('photos/test.jpg');

      expect(note).toBeNull();
    });
  });
});
