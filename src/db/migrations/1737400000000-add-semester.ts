import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSemester1737400000000 implements MigrationInterface {
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
                                "startDate"     date NOT NULL,
                                "endDate"       date NOT NULL
      )
    `);

    // 2. Create default semester
    const defaultSemesterId = 'default-semester-id';
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const defaultYear = `${currentYear}/${nextYear}`;
    const startDate = `${currentYear}-08-15`;
    const endDate = `${nextYear}-07-31`;

    await queryRunner.query(
      `INSERT INTO "semester" ("id", "createdAt", "updatedAt", "version", "appInstanceId", "name", "startDate", "endDate")
       VALUES (?, datetime('now'), datetime('now'), 1, '', ?, ?, ?)`,
      [defaultSemesterId, defaultYear, startDate, endDate],
    );

    console.log(`Created default semester: ${defaultYear}`);

    // 3. Add semesterId column to subject
    await queryRunner.query(`
      ALTER TABLE "subject" ADD COLUMN "semesterId" varchar
    `);

    console.log('Migration completed successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Rolling back migration: ' + this.name);

    await queryRunner.query(`
      ALTER TABLE "subject" DROP COLUMN "semesterId"
    `);

    await queryRunner.query(`
      DROP TABLE "semester"
    `);

    console.log('Rollback completed successfully');
  }
}
