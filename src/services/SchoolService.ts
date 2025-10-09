import { getRepositories } from '@/db/data-source';
import { School } from '@/db/entities/School';
import { Grade } from '@/db/entities';

export class SchoolService {
  /**
   * Fetches all schools from the database
   * @returns Promise<School[]> - A promise that resolves to an array of schools
   */
  static async fetchAll(): Promise<School[]> {
    try {
      const { school: schoolRepo } = getRepositories();
      return await schoolRepo.find({ order: { name: 'ASC' } });
    } catch (error) {
      console.error('Failed to fetch schools:', error);
      throw error;
    }
  }

  /**
   * Adds a new school to the database
   * @param newSchoolData - The data for the new school
   * @returns Promise<School> - A promise that resolves to the newly created school
   */
  static async add(newSchoolData: {
    name: string;
    type?: string;
    address?: string;
  }): Promise<School> {
    try {
      const { school: schoolRepo } = getRepositories();
      const newSchool = schoolRepo.create(newSchoolData);
      return await schoolRepo.save(newSchool);
    } catch (error) {
      console.error('Failed to add school:', error);
      throw error;
    }
  }

  /**
   * Updates an existing school in the database
   * @param updatedSchoolData - The updated school data
   * @returns Promise<School> - A promise that resolves to the updated school
   */
  static async update(
    updatedSchoolData: Partial<School> & { id: string },
  ): Promise<School> {
    try {
      const { school: schoolRepo } = getRepositories();

      // First, find the existing school
      const existingSchool = await schoolRepo.findOne({
        where: { id: updatedSchoolData.id },
      });
      if (!existingSchool) {
        throw new Error(
          `School with ID ${updatedSchoolData.id} not found for update.`,
        );
      }

      // Merge the updated data with the existing school
      const mergedSchool = schoolRepo.create({
        ...existingSchool,
        ...updatedSchoolData,
      });

      return await schoolRepo.save(mergedSchool);
    } catch (error) {
      console.error('Failed to update school:', error);
      throw error;
    }
  }

  /**
   * Deletes a school from the database
   * @param schoolId - The ID of the school to delete
   * @returns Promise<string> - A promise that resolves to the ID of the deleted school
   */
  static async delete(schoolId: string): Promise<string> {
    try {
      const { school: schoolRepo } = getRepositories();
      const deleteResult = await schoolRepo.delete(schoolId);
      if (deleteResult.affected === 0) {
        throw new Error(`School with ID ${schoolId} not found for deletion.`);
      }
      return schoolId;
    } catch (error) {
      console.error('Failed to delete school:', error);
      throw error;
    }
  }

  /**
   * Finds a school by its ID
   * @param id - The ID of the school to find
   * @returns Promise<School | null> - A promise that resolves to the school or null if not found
   */
  static async findById(id: string): Promise<School | null> {
    try {
      const { school: schoolRepo } = getRepositories();
      return await schoolRepo.findOne({ where: { id } });
    } catch (error) {
      console.error(`Failed to find school with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Calculates the average grade for a specific school
   * @param schoolId - The ID of the school
   * @param grades - Array of grades to calculate from
   * @returns number | null - The calculated average or null if no grades exist
   */
  static calculateSchoolAverage(
    schoolId: string,
    grades: Grade[] | undefined,
  ): number | undefined {
    if (!grades || grades.length === 0) return undefined;

    const schoolGrades = grades.filter(
      (grade) =>
        grade.exam &&
        grade.exam.subject &&
        grade.exam.subject.schoolId &&
        grade.exam.subject.schoolId === schoolId,
    );
    if (schoolGrades.length === 0) return undefined;

    const totalScore = schoolGrades.reduce(
      (acc, grade) => acc + grade.score * grade.weight,
      0,
    );
    const totalWeight = schoolGrades.reduce(
      (acc, grade) => acc + grade.weight,
      0,
    );
    return totalWeight ? totalScore / totalWeight : undefined;
  }
}
