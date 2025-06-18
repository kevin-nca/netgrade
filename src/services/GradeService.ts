import { getRepositories, getDataSource } from '@/db/data-source';
import { Grade } from '@/db/entities/Grade';
import { Exam } from '@/db/entities/Exam';

export interface AddExamAndGradePayload {
  subjectId: string;
  examName: string;
  date: Date;
  score: number;
  weight: number;
  comment?: string;
}

export class GradeService {
  /**
   * Fetches all grades from the database
   * @returns Promise<Grade[]> - A promise that resolves to an array of grades
   */
  static async fetchAll(): Promise<Grade[]> {
    try {
      const { grade: gradeRepo } = getRepositories();
      return await gradeRepo.find({
        relations: {
          exam: {
            subject: true,
          },
        },
        order: {
          date: 'DESC',
        },
      });
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

      return await dataSource.transaction(async (transactionManager) => {
        const existingExam = await transactionManager.findOne(Exam, {
          where: {
            name: payload.examName,
            date: payload.date,
            subjectId: payload.subjectId,
          },
        });
        let savedExam: Exam;
        if (existingExam) {
          console.log(`Updating existing exam: ${payload.examName}`);
          existingExam.isCompleted = true;
          existingExam.weight = payload.weight;
          savedExam = await transactionManager.save(existingExam);
        } else {
          const newExamData: Partial<Exam> = {
            name: payload.examName,
            date: payload.date,
            subjectId: payload.subjectId,
            weight: payload.weight,
            isCompleted: true,
          };
          const newExam = transactionManager.create(Exam, newExamData);
          savedExam = await transactionManager.save(newExam);
        }
        const newGradeData: Partial<Grade> = {
          score: payload.score,
          weight: payload.weight,
          comment: payload.comment ?? null,
          date: payload.date,
        };
        const newGrade = transactionManager.create(Grade, newGradeData);
        const savedGrade = await transactionManager.save(newGrade);
        savedExam.gradeId = savedGrade.id;
        await transactionManager.save(savedExam);
        const finalGrade = await transactionManager.findOne(Grade, {
          where: { id: savedGrade.id },
          relations: ['exam', 'exam.subject'],
        });

        if (!finalGrade) {
          throw new Error('Failed to retrieve saved grade with relations.');
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

      const existingGrade = await gradeRepo.findOne({
        where: { id: updatedGradeData.id },
        relations: ['exam'],
      });

      if (!existingGrade) {
        throw new Error(
          `Grade with ID ${updatedGradeData.id} not found for update.`,
        );
      }

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
      const dataSource = getDataSource();

      return await dataSource.transaction(async (transactionManager) => {
        const grade = await transactionManager.findOne(Grade, {
          where: { id: gradeId },
          relations: ['exam'],
        });

        if (!grade) {
          throw new Error(`Grade with ID ${gradeId} not found for deletion.`);
        }

        if (grade.exam) {
          grade.exam.gradeId = null;
          await transactionManager.save(grade.exam);
        }
        await transactionManager.delete(Grade, gradeId);

        return gradeId;
      });
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
        // Update exam
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

        // Update grade
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

        // Return with relations
        const finalGrade = await transactionManager.findOne(Grade, {
          where: { id: savedGrade.id },
          relations: ['exam'],
        });

        if (!finalGrade) {
          throw new Error('Failed to retrieve updated grade with relations.');
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
