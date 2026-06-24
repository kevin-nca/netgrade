import { getRepositories, getDataSource } from '@/db/data-source';
import { Exam } from '@/db/entities/Exam';
import { ExamScan } from '@/db/entities/ExamScan';
import { Grade } from '@/db/entities/Grade';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import {
  DocumentScanner,
  ResponseType,
} from '@capgo/capacitor-document-scanner';
import {
  Ocr,
  type RecognitionResult,
  type RecognitionResults,
} from '@jcesarmobile/capacitor-ocr';
import { FoundationModels } from '@/plugins/foundationModels';

/** Structured data extracted from a scanned exam by OCR + on-device LLM. */
export interface ScanAnalysis {
  subjectName: string | null;
  matchedSubjectId: string | null;
  date: string | null;
  examName: string | null;
  score: number | null;
  pointsAchieved: number | null;
  pointsMax: number | null;
}

/** Payload to create a complete exam (with optional grade) from a scan. */
export interface CreateExamFromScanPayload {
  subjectId: string;
  name: string;
  date: Date;
  weight: number;
  score: number | null;
  pointsAchieved: number | null;
  pointsMax: number | null;
  photoPaths: string[];
}

export class ExamService {
  /**
   * Fetches all exams from the database
   * @returns Promise<Exam[]> - A promise that resolves to an array of exams
   */
  static async fetchAll(): Promise<Exam[]> {
    try {
      const { exam: examRepo } = getRepositories();
      return await examRepo.find({ order: { date: 'DESC' } });
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      throw error;
    }
  }

  /**
   * Adds a new exam to the database
   * @param newExamData - The data for the new exam
   * @returns Promise<Exam> - A promise that resolves to the newly created exam
   */
  static async add(newExamData: {
    schoolId: string;
    subjectId: string;
    title: string;
    date: Date;
    description?: string;
    weight?: number;
  }): Promise<Exam> {
    try {
      const { exam: examRepo } = getRepositories();
      // Map title to name as the entity uses name
      const examData = {
        ...newExamData,
        name: newExamData.title,
      };

      const newExam = examRepo.create(examData);
      return await examRepo.save(newExam);
    } catch (error) {
      console.error('Failed to add exam:', error);
      throw error;
    }
  }

  /**
   * Updates an existing exam in the database
   * @param updatedExamData - The updated exam data
   * @returns Promise<Exam> - A promise that resolves to the updated exam
   */
  static async update(
    updatedExamData: Partial<Exam> & { id: string },
  ): Promise<Exam> {
    try {
      const { exam: examRepo } = getRepositories();

      // First, find the existing exam
      const existingExam = await examRepo.findOne({
        where: { id: updatedExamData.id },
      });
      if (!existingExam) {
        throw new Error(
          `Exam with ID ${updatedExamData.id} not found for update.`,
        );
      }

      // Merge the updated data with the existing exam
      const mergedExam = examRepo.create({
        ...existingExam,
        ...updatedExamData,
      });

      return await examRepo.save(mergedExam);
    } catch (error) {
      console.error('Failed to update exam:', error);
      throw error;
    }
  }

  /**
   * Deletes an exam from the database
   * @param examId - The ID of the exam to delete
   * @returns Promise<string> - A promise that resolves to the ID of the deleted exam
   */
  static async delete(examId: string): Promise<string> {
    try {
      const { exam: examRepo } = getRepositories();
      const deleteResult = await examRepo.delete(examId);
      if (deleteResult.affected === 0) {
        throw new Error(`Exam with ID ${examId} not found for deletion.`);
      }
      return examId;
    } catch (error) {
      console.error('Failed to delete exam:', error);
      throw error;
    }
  }

  /**
   * Finds an exam by its ID
   * @param id - The ID of the exam to find
   * @returns Promise<Exam | null> - A promise that resolves to the exam or null if not found
   */
  static async findById(id: string): Promise<Exam | null> {
    try {
      const { exam: examRepo } = getRepositories();
      return await examRepo.findOne({
        where: { id },
        relations: { scans: true },
        order: { scans: { createdAt: 'ASC' } },
      });
    } catch (error) {
      console.error(`Failed to find exam with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Finds exams by subject ID
   * @param subjectId - The ID of the subject to find exams for
   * @returns Promise<Exam[]> - A promise that resolves to an array of exams
   */
  static async findBySubjectId(subjectId: string): Promise<Exam[]> {
    try {
      const { exam: examRepo } = getRepositories();
      return await examRepo.find({
        where: { subjectId },
        order: { date: 'DESC' },
      });
    } catch (error) {
      console.error(`Failed to find exams for subject ID ${subjectId}:`, error);
      throw error;
    }
  }

  /**
   * Fetches upcoming exams from the database that don't have grades yet
   * @returns Promise<Exam[]> - A promise that resolves to an array of upcoming exams without grades
   */
  static async fetchUpcoming(): Promise<Exam[]> {
    try {
      const { exam: examRepo } = getRepositories();
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const upcomingExams = await examRepo
        .createQueryBuilder('exam')
        .leftJoin('exam.grade', 'grade')
        .where('exam.date >= :now', { now })
        .orderBy('exam.date', 'ASC')
        .getMany();

      return upcomingExams;
    } catch (error) {
      console.error('Failed to fetch upcoming exams:', error);
      throw error;
    }
  }

  static async takeExamPhoto(): Promise<string[]> {
    const result = await DocumentScanner.scanDocument({
      responseType: Capacitor.isNativePlatform()
        ? ResponseType.ImageFilePath
        : ResponseType.Base64,
    });

    if (result.status !== 'success' || !result.scannedImages?.length) {
      throw new Error('Scan abgebrochen oder fehlgeschlagen.');
    }

    const savedPaths: string[] = [];

    for (const scanned of result.scannedImages) {
      const destPath = `photos/${crypto.randomUUID()}.jpg`;

      if (Capacitor.isNativePlatform()) {
        const { data } = await Filesystem.readFile({ path: scanned });
        await Filesystem.writeFile({
          path: destPath,
          data,
          directory: Directory.Data,
          recursive: true,
        });
      } else {
        await Filesystem.writeFile({
          path: destPath,
          data: scanned,
          directory: Directory.Data,
          recursive: true,
        });
      }

      savedPaths.push(destPath);
    }

    return savedPaths;
  }

  /**
   * Reads a scanned photo via OCR, then asks Apple's on-device Foundation
   * Models for the grade. Falls back to a plain regex on the OCR text if the
   * model is unavailable or returns nothing usable. Returns the grade or null.
   */
  static async analyzeScan(photoPath: string): Promise<ScanAnalysis> {
    const { uri } = await Filesystem.getUri({
      path: photoPath,
      directory: Directory.Data,
    });
    const ocr: RecognitionResults = await Ocr.process({ image: uri });
    const ocrText = ocr.results.map((r: RecognitionResult) => r.text).join(' ');
    console.log('[OCR-Text]', ocrText);

    const empty: ScanAnalysis = {
      subjectName: null,
      matchedSubjectId: null,
      date: null,
      examName: null,
      score: null,
      pointsAchieved: null,
      pointsMax: null,
    };

    try {
      const data = await FoundationModels.generateExamData({ prompt: ocrText });
      return {
        subjectName: data.subjectName ?? null,
        matchedSubjectId: null,
        date: data.date ?? null,
        examName: data.examName ?? null,
        score: data.score ?? null,
        pointsAchieved: data.pointsAchieved ?? null,
        pointsMax: data.pointsMax ?? null,
      };
    } catch (err) {
      console.log('[AI nicht verfügbar]', (err as Error).message);
      return empty;
    }
  }

  /**
   * Creates an exam together with its grade (if a score is present) and scans
   * in a single transaction. Returns the created exam id.
   */
  static async createFromScan(
    payload: CreateExamFromScanPayload,
  ): Promise<string> {
    const dataSource = getDataSource();

    return await dataSource.transaction(async (manager) => {
      const exam = manager.create(Exam, {
        name: payload.name,
        date: payload.date,
        subjectId: payload.subjectId,
        weight: payload.weight,
        isCompleted: payload.score != null,
        pointsAchieved: payload.pointsAchieved,
        pointsMax: payload.pointsMax,
      });
      const savedExam = await manager.save(exam);

      if (payload.score != null) {
        const grade = manager.create(Grade, {
          score: payload.score,
          weight: payload.weight,
          comment: null,
          date: payload.date,
        });
        const savedGrade = await manager.save(grade);
        savedExam.gradeId = savedGrade.id;
        await manager.save(savedExam);
      }

      if (payload.photoPaths.length > 0) {
        const scans = payload.photoPaths.map((photoPath) =>
          manager.create(ExamScan, { examId: savedExam.id, photoPath }),
        );
        await manager.save(scans);
      }

      return savedExam.id;
    });
  }

  static async addScans(
    examId: string,
    photoPaths: string[],
  ): Promise<ExamScan[]> {
    const scanRepo = getDataSource().getRepository(ExamScan);
    const scans = photoPaths.map((photoPath) =>
      scanRepo.create({ examId, photoPath }),
    );
    return scanRepo.save(scans);
  }

  static async deleteScan(scanId: string): Promise<string> {
    const scanRepo = getDataSource().getRepository(ExamScan);
    const scan = await scanRepo.findOneBy({ id: scanId });
    if (!scan) {
      throw new Error(`ExamScan with ID ${scanId} not found.`);
    }

    try {
      await Filesystem.deleteFile({
        path: scan.photoPath,
        directory: Directory.Data,
      });
    } catch {
      // file may already be gone
    }

    await scanRepo.delete(scanId);
    return scanId;
  }

  static async resolvePhotoSrc(photoPath: string): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      const { uri } = await Filesystem.getUri({
        path: photoPath,
        directory: Directory.Data,
      });
      return Capacitor.convertFileSrc(uri);
    }
    const { data } = await Filesystem.readFile({
      path: photoPath,
      directory: Directory.Data,
    });
    return `data:image/jpeg;base64,${data as string}`;
  }
}
