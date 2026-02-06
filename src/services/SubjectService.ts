import { getRepositories } from '@/db/data-source';
import { Subject } from '@/db/entities';

export class SubjectService {
  /**
   * Fetches all subjects from the database
   * @returns Promise<Subject[]> - A promise that resolves to an array of subjects
   */
  static async fetchAll(): Promise<Subject[]> {
    try {
      const { subject: subjectRepo } = getRepositories();
      return await subjectRepo.find({
        order: { name: 'ASC' },
        relations: {
          exams: {
            grade: true,
          },
        },
      });
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      throw error;
    }
  }

  /**
   * Adds a new subject to the database
   * @param newSubjectData - The data for the new subject
   * @returns Promise<Subject> - A promise that resolves to the newly created subject
   */
  static async add(newSubjectData: {
    name: string;
    schoolId: string;
    teacher?: string | null;
    description?: string | null;
    weight?: number;
    semesterId?: string | null;
  }): Promise<Subject> {
    try {
      const { subject: subjectRepo } = getRepositories();

      const semesterId =
        newSubjectData.semesterId || (await this.getOrCreateDefaultSemester());

      const newSubject = subjectRepo.create({
        ...newSubjectData,
        semesterId,
      });
      return await subjectRepo.save(newSubject);
    } catch (error) {
      console.error('Failed to add subject:', error);
      throw error;
    }
  }

  /**
   * Updates an existing subject in the database
   * @param updatedSubjectData - The updated subject data
   * @returns Promise<Subject> - A promise that resolves to the updated subject
   */
  static async update(
    updatedSubjectData: Partial<Subject> & { id: string },
  ): Promise<Subject> {
    try {
      const { subject: subjectRepo } = getRepositories();

      // First, find the existing subject
      const existingSubject = await subjectRepo.findOne({
        where: { id: updatedSubjectData.id },
      });
      if (!existingSubject) {
        throw new Error(
          `Subject with ID ${updatedSubjectData.id} not found for update.`,
        );
      }

      // Merge the updated data with the existing subject
      const mergedSubject = subjectRepo.create({
        ...existingSubject,
        ...updatedSubjectData,
      });

      return await subjectRepo.save(mergedSubject);
    } catch (error) {
      console.error('Failed to update subject:', error);
      throw error;
    }
  }

  /**
   * Deletes a subject from the database
   * @param subjectId - The ID of the subject to delete
   * @returns Promise<string> - A promise that resolves to the ID of the deleted subject
   */
  static async delete(subjectId: string): Promise<string> {
    try {
      const { subject: subjectRepo } = getRepositories();
      const deleteResult = await subjectRepo.delete(subjectId);
      if (deleteResult.affected === 0) {
        throw new Error(`Subject with ID ${subjectId} not found for deletion.`);
      }
      return subjectId;
    } catch (error) {
      console.error('Failed to delete subject:', error);
      throw error;
    }
  }

  /**
   * Finds a subject by its ID
   * @param id - The ID of the subject to find
   * @returns Promise<Subject | null> - A promise that resolves to the subject or null if not found
   */
  static async findById(id: string): Promise<Subject | null> {
    try {
      const { subject: subjectRepo } = getRepositories();
      return await subjectRepo.findOne({ where: { id } });
    } catch (error) {
      console.error(`Failed to find subject with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Finds subjects by school ID
   * @param schoolId - The ID of the school to find subjects for
   * @returns Promise<Subject[]> - A promise that resolves to an array of subjects
   */
  static async findBySchoolId(schoolId: string): Promise<Subject[]> {
    try {
      const { subject: subjectRepo } = getRepositories();
      return await subjectRepo.find({
        where: { schoolId },
        order: { name: 'ASC' },
        relations: {
          exams: {
            grade: true,
          },
        },
      });
    } catch (error) {
      console.error(
        `Failed to find subjects for school ID ${schoolId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Gets or creates the default semester
   * @returns Promise<string> - The ID of the default semester
   */
  private static async getOrCreateDefaultSemester(): Promise<string> {
    const { semester: semesterRepo } = getRepositories();

    const defaultSemesterId = 'default-semester-id';

    let defaultSemester = await semesterRepo.findOne({
      where: { id: defaultSemesterId },
    });

    if (!defaultSemester) {
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;

      defaultSemester = semesterRepo.create({
        id: defaultSemesterId,
        name: `${currentYear}/${nextYear}`,
        startDate: new Date(`${currentYear}-08-15`),
        endDate: new Date(`${nextYear}-07-31`),
      });

      await semesterRepo.save(defaultSemester);
      console.log(`Created default semester: ${currentYear}/${nextYear}`);
    }

    return defaultSemester.id;
  }
}
