import { getRepositories } from '@/db/data-source';
import { Exam } from '@/db/entities/Exam';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { DocumentScanner, ResponseType } from '@capgo/capacitor-document-scanner';

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
      return await examRepo.findOne({ where: { id } });
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

  /**
   * Takes a picture of an exam and saves it to the filesystem
   * @param examId - The ID of the exam to attach the photo to
   * @returns Promise<string> - The saved file path
   */
  static async takeExamPhoto(): Promise<string> {
    const result = await DocumentScanner.scanDocument({
      responseType: Capacitor.isNativePlatform()
        ? ResponseType.ImageFilePath
        : ResponseType.Base64,
    });

    if (result.status !== 'success' || !result.scannedImages?.length) {
      throw new Error('Scan abgebrochen oder fehlgeschlagen.');
    }

    const scanned = result.scannedImages[0];
    const destPath = `photos/${crypto.randomUUID()}.jpg`;

    if (Capacitor.isNativePlatform()) {
      await Filesystem.copy({
        from: scanned,
        to: destPath,
        toDirectory: Directory.Data,
      });
    } else {
      await Filesystem.writeFile({
        path: destPath,
        data: scanned,
        directory: Directory.Data,
        recursive: true,
      });
    }

    return destPath;
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
