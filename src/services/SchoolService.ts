import { getRepositories } from '@/db/data-source';
import { School } from '@/db/entities/School';
import { Grade } from '@/db/entities';
import { Subject } from '@/db/entities/Subject';

export class SchoolService {
  static async fetchAll(): Promise<School[]> {
    try {
      const { school: schoolRepo } = getRepositories();
      return await schoolRepo.find({
        order: { name: 'ASC' },
        relations: {
          semesters: {
            subjects: {
              exams: {
                grade: true,
              },
            },
          },
        },
      });
    } catch (error) {
      console.error('Failed to fetch schools:', error);
      throw error;
    }
  }

  static async add(newSchoolData: {
    name: string;
    type?: string;
    address?: string;
  }): Promise<School> {
    try {
      const { school: schoolRepo, semester: semesterRepo } = getRepositories();

      const newSchool = schoolRepo.create(newSchoolData);
      const savedSchool = await schoolRepo.save(newSchool);

      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;

      const defaultSemester = semesterRepo.create({
        name: `${currentYear}/${nextYear}`,
        startDate: new Date(`${currentYear}-08-15`),
        endDate: new Date(`${nextYear}-07-31`),
        schoolId: savedSchool.id,
      });
      await semesterRepo.save(defaultSemester);

      // Return school with semesters so callers can access semesterId directly
      return (await schoolRepo.findOne({
        where: { id: savedSchool.id },
        relations: { semesters: true },
      })) as School;
    } catch (error) {
      console.error('Failed to add school:', error);
      throw error;
    }
  }

  static async update(
    updatedSchoolData: Partial<School> & { id: string },
  ): Promise<School> {
    try {
      const { school: schoolRepo } = getRepositories();

      const existingSchool = await schoolRepo.findOne({
        where: { id: updatedSchoolData.id },
      });
      if (!existingSchool) {
        throw new Error(
          `School with ID ${updatedSchoolData.id} not found for update.`,
        );
      }

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

  static async findById(id: string): Promise<School | null> {
    try {
      const { school: schoolRepo } = getRepositories();
      return await schoolRepo.findOne({ where: { id } });
    } catch (error) {
      console.error(`Failed to find school with ID ${id}:`, error);
      throw error;
    }
  }

  static calculateSchoolAverage(school: School): number | undefined {
    const allSubjects = school.semesters.flatMap(
      (semester) => semester.subjects,
    );

    const subjectAverages = allSubjects
      .map((subject) => this.calculateSubjectAverage(subject))
      .filter((avg): avg is number => avg !== undefined);

    if (subjectAverages.length === 0) return undefined;

    const totalScore = subjectAverages.reduce((acc, avg) => acc + avg, 0);
    const average = totalScore / subjectAverages.length;

    return Number(average.toFixed(1));
  }

  static calculateSubjectAverage(subject: Subject): number | undefined {
    const grades = subject.exams
      .map((exam) => exam.grade)
      .filter((grade): grade is Grade => grade !== null);

    if (grades.length === 0) return undefined;

    const totalScore = grades.reduce(
      (acc, grade) => acc + grade.score * grade.weight,
      0,
    );
    const totalWeight = grades.reduce((acc, grade) => acc + grade.weight, 0);

    if (totalWeight === 0) return undefined;

    return Number((totalScore / totalWeight).toFixed(2));
  }
}
