import { getRepositories } from '@/db/data-source';
import { Semester } from '@/db/entities/Semester';

export class SemesterService {
  /**
   * Fetches all semesters from the database
   * @returns Promise<Semester[]> - A promise that resolves to an array of semesters
   */
  static async fetchAll(): Promise<Semester[]> {
    try {
      const { semester: semesterRepo } = getRepositories();
      return await semesterRepo.find({
        order: { startDate: 'DESC' },
        relations: {
          subjects: true,
        },
      });
    } catch (error) {
      console.error('Failed to fetch semesters:', error);
      throw error;
    }
  }

  /**
   * Adds a new semester to the database
   * @param newSemesterData - The data for the new semester
   * @returns Promise<Semester> - A promise that resolves to the newly created semester
   */
  static async add(newSemesterData: {
    name: string;
    startDate: Date;
    endDate: Date;
  }): Promise<Semester> {
    try {
      const { semester: semesterRepo } = getRepositories();

      const newSemester = semesterRepo.create({
        name: newSemesterData.name,
        startDate: newSemesterData.startDate,
        endDate: newSemesterData.endDate,
      });
      return await semesterRepo.save(newSemester);
    } catch (error) {
      console.error('Failed to add semester:', error);
      throw error;
    }
  }

  /**
   * Updates an existing semester in the database
   * @param updatedSemesterData - The updated semester data
   * @returns Promise<Semester> - A promise that resolves to the updated semester
   */
  static async update(
    updatedSemesterData: Partial<Semester> & { id: string },
  ): Promise<Semester> {
    try {
      const { semester: semesterRepo } = getRepositories();

      // First, find the existing semester
      const existingSemester = await semesterRepo.findOne({
        where: { id: updatedSemesterData.id },
      });
      if (!existingSemester) {
        throw new Error(
          `Semester with ID ${updatedSemesterData.id} not found for update.`,
        );
      }

      // Merge the updated data with the existing semester
      const mergedSemester = semesterRepo.create({
        ...existingSemester,
        ...updatedSemesterData,
      });

      return await semesterRepo.save(mergedSemester);
    } catch (error) {
      console.error('Failed to update semester:', error);
      throw error;
    }
  }

  /**
   * Deletes a semester from the database
   * @param semesterId - The ID of the semester to delete
   * @returns Promise<string> - A promise that resolves to the ID of the deleted semester
   */
  static async delete(semesterId: string): Promise<string> {
    try {
      const { semester: semesterRepo } = getRepositories();
      const deleteResult = await semesterRepo.delete(semesterId);
      if (deleteResult.affected === 0) {
        throw new Error(
          `Semester with ID ${semesterId} not found for deletion.`,
        );
      }
      return semesterId;
    } catch (error) {
      console.error('Failed to delete semester:', error);
      throw error;
    }
  }

  /**
   * Finds a semester by its ID
   * @param id - The ID of the semester to find
   * @returns Promise<Semester | null> - A promise that resolves to the semester or null if not found
   */
  static async findById(id: string): Promise<Semester | null> {
    try {
      const { semester: semesterRepo } = getRepositories();
      return await semesterRepo.findOne({ where: { id } });
    } catch (error) {
      console.error(`Failed to find semester with ID ${id}:`, error);
      throw error;
    }
  }
}
