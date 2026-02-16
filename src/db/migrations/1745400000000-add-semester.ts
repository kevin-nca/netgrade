import { QueryRunner } from 'typeorm';

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class AddSemester1745400000000 {
  name = 'AddSemester1745400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Running migration: ' + this.name);

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

    await queryRunner.query(`
      ALTER TABLE "subject" ADD COLUMN "semesterId" varchar
    `);

    const id = generateUuid();
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

    await queryRunner.query(`
      UPDATE "subject" SET "semesterId" = '${id}' WHERE "semesterId" IS NULL
    `);

    console.log('Migration completed successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "subject" DROP COLUMN "semesterId"`);
    await queryRunner.query(`DROP TABLE "semester"`);
  }
}
