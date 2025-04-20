import { getRepositories, getDataSource } from '@/db/data-source';
import { Grade } from '@/db/entities/Grade';
import { Exam } from '@/db/entities/Exam';

export interface AddExamAndGradePayload {
  subjectId: string;
  examName: string; // For Exam.name
  date: Date; // For both Exam.date and Grade.date
  score: number; // For Grade.score
  weight: number; // For Grade.weight (also used for Exam.weight if desired)
  comment?: string; // For Grade.comment
}

export class GradeService {
  /**
   * Fetches all grades from the database
   * @returns Promise<Grade[]> - A promise that resolves to an array of grades
   */
  static async fetchAll(): Promise<Grade[]> {
    try {
      const { grade: gradeRepo } = getRepositories();
      return await gradeRepo.find({ relations: ['exam'] });
    } catch (error) {
      console.error('Failed to fetch grades:', error);
      throw error;
    }
  }

  /**
   * Adds a new grade with an exam to the database using a transaction
   * @param payload - The data for the new grade and exam
   * @returns Promise<Grade> - A promise that resolves to the newly created grade
   */
  static async addWithExam(payload: AddExamAndGradePayload): Promise<Grade> {
    try {
      const dataSource = getDataSource();

      // Use a transaction to ensure both exam and grade are created atomically
      return await dataSource.transaction(async (transactionManager) => {
        // Create the exam
        const newExamData: Partial<Exam> = {
          name: payload.examName,
          date: payload.date,
          subjectId: payload.subjectId,
          weight: payload.weight,
          isCompleted: true,
        };
        const newExam = transactionManager.create(Exam, newExamData);
        const savedExam = await transactionManager.save(newExam);

        // Create the grade and link it to the exam
        const newGradeData: Partial<Grade> = {
          score: payload.score,
          weight: payload.weight,
          comment: payload.comment ?? null,
          date: payload.date,
          exam: savedExam, // Link the grade to the exam
        };
        const newGrade = transactionManager.create(Grade, newGradeData);
        const savedGrade = await transactionManager.save(newGrade);

        // Fetch the grade with its exam relationship
        const finalGrade = await transactionManager.findOne(Grade, {
          where: { id: savedGrade.id },
          relations: ['exam'],
        });

        if (!finalGrade) {
          throw new Error(
            'Failed to retrieve the saved grade with its exam relationship.',
          );
        }

        return finalGrade;
      });
    } catch (error) {
      console.error('Failed to add exam and grade:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to add exam and grade';
      throw new Error(message);
    }
  }

  /**
   * Updates an existing grade in the database
   * @param updatedGradeData - The updated grade data
   * @returns Promise<Grade> - A promise that resolves to the updated grade
   */
  static async update(
    updatedGradeData: Partial<Grade> & { id: string },
  ): Promise<Grade> {
    try {
      const { grade: gradeRepo } = getRepositories();

      // First, find the existing grade
      const existingGrade = await gradeRepo.findOne({
        where: { id: updatedGradeData.id },
        relations: ['exam'],
      });

      if (!existingGrade) {
        throw new Error(
          `Grade with ID ${updatedGradeData.id} not found for update.`,
        );
      }

      // Merge the updated data with the existing grade
      const mergedGrade = gradeRepo.create({
        ...existingGrade,
        ...updatedGradeData,
      });

      return await gradeRepo.save(mergedGrade);
    } catch (error) {
      console.error('Failed to update grade:', error);
      throw error;
    }
  }

  /**
   * Deletes a grade from the database
   * @param gradeId - The ID of the grade to delete
   * @returns Promise<string> - A promise that resolves to the ID of the deleted grade
   */
  static async delete(gradeId: string): Promise<string> {
    try {
      const { grade: gradeRepo } = getRepositories();
      const deleteResult = await gradeRepo.delete(gradeId);
      if (deleteResult.affected === 0) {
        throw new Error(`Grade with ID ${gradeId} not found for deletion.`);
      }
      return gradeId;
    } catch (error) {
      console.error('Failed to delete grade:', error);
      throw error;
    }
  }

  /**
   * Finds a grade by its ID
   * @param id - The ID of the grade to find
   * @returns Promise<Grade | null> - A promise that resolves to the grade or null if not found
   */
  static async findById(id: string): Promise<Grade | null> {
    try {
      const { grade: gradeRepo } = getRepositories();
      return await gradeRepo.findOne({
        where: { id },
        relations: ['exam'],
      });
    } catch (error) {
      console.error(`Failed to find grade with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Finds grades by exam ID
   * @param examId - The ID of the exam to find grades for
   * @returns Promise<Grade[]> - A promise that resolves to an array of grades
   */
  static async findByExamId(examId: string): Promise<Grade[]> {
    try {
      const { grade: gradeRepo } = getRepositories();
      return await gradeRepo.find({
        where: { exam: { id: examId } },
        relations: ['exam'],
      });
    } catch (error) {
      console.error(`Failed to find grades for exam ID ${examId}:`, error);
      throw error;
    }
  }

  /**
   * Updates both an exam and a grade in a single transaction
   * @param examData - The updated exam data
   * @param gradeData - The updated grade data
   * @returns Promise<Grade> - A promise that resolves to the updated grade
   */
  static async updateExamAndGrade(
    examData: Partial<Exam> & { id: string },
    gradeData: Partial<Grade> & { id: string },
  ): Promise<Grade> {
    try {
      const dataSource = getDataSource();

      // Use a transaction to ensure both exam and grade are updated atomically
      return await dataSource.transaction(async (transactionManager) => {
        // First, find the existing exam
        const existingExam = await transactionManager.findOne(Exam, {
          where: { id: examData.id },
        });

        if (!existingExam) {
          throw new Error(`Exam with ID ${examData.id} not found for update.`);
        }

        // Merge and save the updated exam
        const mergedExam = transactionManager.create(Exam, {
          ...existingExam,
          ...examData,
        });
        await transactionManager.save(mergedExam);

        // Find the existing grade
        const existingGrade = await transactionManager.findOne(Grade, {
          where: { id: gradeData.id },
          relations: ['exam'],
        });

        if (!existingGrade) {
          throw new Error(
            `Grade with ID ${gradeData.id} not found for update.`,
          );
        }

        // Merge and save the updated grade
        const mergedGrade = transactionManager.create(Grade, {
          ...existingGrade,
          ...gradeData,
        });
        const savedGrade = await transactionManager.save(mergedGrade);

        // Fetch the updated grade with its exam relationship
        const finalGrade = await transactionManager.findOne(Grade, {
          where: { id: savedGrade.id },
          relations: ['exam'],
        });

        if (!finalGrade) {
          throw new Error(
            'Failed to retrieve the updated grade with its exam relationship.',
          );
        }

        return finalGrade;
      });
    } catch (error) {
      console.error('Failed to update exam and grade:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update exam and grade';
      throw new Error(message);
    }
  }
}
