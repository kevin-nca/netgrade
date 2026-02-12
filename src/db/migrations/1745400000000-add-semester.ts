import { QueryRunner } from 'typeorm';
import { getRepositories } from '@/db/data-source';

export class AddSemester1745400000000 {
  name = 'AddSemester1745400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Running migration: ' + this.name);

    // 1. Create semester table
    await queryRunner.query(`
      CREATE TABLE "semester" (
                                "id"            varchar PRIMARY KEY NOT NULL,
                                "createdAt"     datetime NOT NULL DEFAULT (datetime('now')),
                                "updatedAt"     datetime NOT NULL DEFAULT (datetime('now')),
                                "version"       integer NOT NULL DEFAULT 1,
                                "appInstanceId" varchar(255),
                                "name"          varchar NOT NULL,
                                "startDate"     date NOT NULL,
                                "endDate"       date NOT NULL
      )
    `);

    // 2. Add semesterId column to subject
    await queryRunner.query(`
      ALTER TABLE "subject" ADD COLUMN "semesterId" varchar
    `);

    // 3. Create default semester using repository
    const { semester: semesterRepo } = getRepositories();

    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const defaultYear = `${currentYear}/${nextYear}`;
    const startDate = new Date(`${currentYear}-08-15`);
    const endDate = new Date(`${nextYear}-07-31`);

    const defaultSemester = semesterRepo.create({
      name: defaultYear,
      startDate: startDate,
      endDate: endDate,
    });

    try {
      await semesterRepo.save(defaultSemester);
      console.log(
        `Created default semester: ${defaultYear} with ID: ${defaultSemester.id}`,
      );
    } catch (error) {
      console.error(
        'Failed to create default semester during migration:',
        error,
      );
      throw error;
    }

    console.log('Migration completed successfully');
  }
}
