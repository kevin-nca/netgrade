import { QueryRunner } from 'typeorm';
import { uuidv4 } from 'zod';

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

    // 3. Insert default semester direkt via SQL
    const id = uuidv4();
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    await queryRunner.query(`
      INSERT INTO "semester" ("id", "version", "name", "startDate", "endDate")
      VALUES (
        '${id}',
        1,
        '${currentYear}/${nextYear}',
        '${currentYear}-08-15',
        '${nextYear}-07-31'
      )
    `);

    // 4. Alle bestehenden Subjects dem Default-Semester zuweisen
    await queryRunner.query(`
      UPDATE "subject" SET "semesterId" = '${id}' WHERE "semesterId" IS NULL
    `);

    console.log('Migration completed successfully');
  }
}
