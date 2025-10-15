import { getRepositories } from '@/db/data-source';
import { School } from '@/db/entities/School';
import { Grade } from '@/db/entities';
import { Subject } from '@/db/entities/Subject';

export class SchoolService {
  /**
   * Fetches all schools from the database
   * @returns Promise<School[]> - A promise that resolves to an array of schools
   */
  static async fetchAll(): Promise<School[]> {
    try {
      const { school: schoolRepo } = getRepositories();
      return await schoolRepo.find({
        order: { name: 'ASC' },
        relations: {
          subjects: {
            exams: {
              grade: true,
            },
          },
        },
      });
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
   * @param school - The school entity with loaded subjects and their exams/grades relations
   * @returns number | undefined - The calculated average or undefined if no grades exist
   */
  static calculateSchoolAverage(school: School): number | undefined {
    // Check if school has subjects
    if (!school.subjects || school.subjects.length === 0) return undefined;

    // Calculate average for each subject
    const subjectAverages = school.subjects
      .map((subject) => this.calculateSubjectAverage(subject))
      .filter((avg): avg is number => avg !== undefined);

    if (subjectAverages.length === 0) return undefined;

    const totalScore = subjectAverages.reduce((acc, avg) => acc + avg, 0);
    const totalCount = subjectAverages.length;
    const average = totalScore / totalCount;

    return Number(average.toFixed(1));
  }

  /**
   * Calculates the average grade for a specific subject
   * @param subject - The subject entity with loaded exams and grades relations
   * @returns number | undefined - The calculated average or undefined if no grades exist
   */
  static calculateSubjectAverage(subject: Subject): number | undefined {
    // Extract grades from the subject's exams
    const grades =
      subject.exams
        ?.map((exam) => exam.grade)
        .filter(
          (grade): grade is Grade => grade !== null && grade !== undefined,
        ) || [];

    if (grades.length === 0) return undefined;

    const totalScore = grades.reduce(
      (acc, grade) => acc + grade.score * grade.weight,
      0,
    );
    const totalWeight = grades.reduce((acc, grade) => acc + grade.weight, 0);

    if (totalWeight === 0) return undefined;

    const average = totalScore / totalWeight;
    return Number(average.toFixed(2));
  }
}
