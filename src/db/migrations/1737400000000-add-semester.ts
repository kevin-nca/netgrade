import { getRepositories } from '@/db/data-source';
import { QueryRunner } from 'typeorm';
import { Temporal } from '@js-temporal/polyfill';

export class AddSemester1737400000000 {
  name = 'AddSemester1737400000000';

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
                                "startDate"     text NOT NULL,
                                "endDate"       text NOT NULL
      )
    `);

    // 2. Add semesterId column to subject
    await queryRunner.query(`
      ALTER TABLE "subject" ADD COLUMN "semesterId" varchar
    `);

    // 3. Create default semester using repository
    const { semester: semesterRepo } = getRepositories();

    const currentYear = Temporal.Now.plainDateISO().year;
    const nextYear = currentYear + 1;
    const defaultYear = `${currentYear}/${nextYear}`;
    const startDate = Temporal.PlainDate.from(`${currentYear}-08-15`);
    const endDate = Temporal.PlainDate.from(`${nextYear}-07-31`);

    const defaultSemester = semesterRepo.create({
      name: defaultYear,
      startDate: new Date(startDate.toString()),
      endDate: new Date(endDate.toString()),
    });

    await semesterRepo.save(defaultSemester);

    console.log(
      `Created default semester: ${defaultYear} with ID: ${defaultSemester.id}`,
    );
    console.log('Migration completed successfully');
  }
}
