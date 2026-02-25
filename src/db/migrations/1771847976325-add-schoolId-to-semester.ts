import { QueryRunner } from 'typeorm';

export class AddSchoolIdToSemester1771847976325 {
  name = 'AddSchoolIdToSemester1771847976325';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Running migration: ' + this.name);

    const columns = await queryRunner.query(`PRAGMA table_info("semester")`);
    const hasSchoolId = columns.some(
      (col: { name: string }) => col.name === 'schoolId',
    );
    if (!hasSchoolId) {
      await queryRunner.query(`
        ALTER TABLE "semester" ADD COLUMN "schoolId" varchar
      `);
    }

    await queryRunner.query(`
      INSERT INTO "semester" ("id", "name", "startDate", "endDate", "version", "schoolId")
      SELECT
        lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6))),
        CAST(strftime('%Y', 'now') AS TEXT) || '/' || CAST(strftime('%Y', 'now', '+1 year') AS TEXT),
        strftime('%Y', 'now') || '-08-15',
        strftime('%Y', 'now', '+1 year') || '-07-31',
        1,
        "school"."id"
      FROM "school"
      WHERE "school"."id" NOT IN (
        SELECT DISTINCT "schoolId" FROM "subject" WHERE "schoolId" IS NOT NULL
      )
    `);

    await queryRunner.query(`
      UPDATE "semester"
      SET "schoolId" = (
        SELECT "schoolId"
        FROM "subject"
        WHERE "subject"."semesterId" = "semester"."id"
        GROUP BY "schoolId"
        ORDER BY COUNT(*) DESC
        LIMIT 1
        )
      WHERE EXISTS (
        SELECT 1 FROM "subject"
        WHERE "subject"."semesterId" = "semester"."id"
        )
    `);

    await queryRunner.query(`
      UPDATE "semester"
      SET "schoolId" = (SELECT "id" FROM "school" LIMIT 1)
      WHERE "schoolId" IS NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "temporary_semester" (
                                          "id"            varchar PRIMARY KEY NOT NULL,
                                          "createdAt"     datetime NOT NULL DEFAULT (datetime('now')),
                                          "updatedAt"     datetime NOT NULL DEFAULT (datetime('now')),
                                          "version"       integer NOT NULL DEFAULT 1,
                                          "appInstanceId" varchar(255),
                                          "name"          varchar NOT NULL,
                                          "startDate"     date NOT NULL,
                                          "endDate"       date NOT NULL,
                                          "schoolId"      varchar NOT NULL,
                                          CONSTRAINT "FK_semester_school" FOREIGN KEY ("schoolId") REFERENCES "school" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      INSERT INTO "temporary_semester"
      ("id", "createdAt", "updatedAt", "version", "appInstanceId", "name", "startDate", "endDate", "schoolId")
      SELECT
        "id", "createdAt", "updatedAt", "version", "appInstanceId", "name", "startDate", "endDate", "schoolId"
      FROM "semester"
    `);

    await queryRunner.query(`DROP TABLE "semester"`);

    await queryRunner.query(
      `ALTER TABLE "temporary_semester" RENAME TO "semester"`,
    );

    await queryRunner.query(`
      CREATE TABLE "temporary_subject" (
                                         "id"            varchar PRIMARY KEY NOT NULL,
                                         "createdAt"     datetime NOT NULL DEFAULT (datetime('now')),
                                         "updatedAt"     datetime NOT NULL DEFAULT (datetime('now')),
                                         "version"       integer NOT NULL DEFAULT 1,
                                         "appInstanceId" varchar(255),
                                         "name"          varchar NOT NULL,
                                         "teacher"       varchar,
                                         "weight"        float NOT NULL DEFAULT (1),
                                         "semesterId"    varchar NOT NULL,
                                         CONSTRAINT "FK_subject_semester" FOREIGN KEY ("semesterId") REFERENCES "semester" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      INSERT INTO "temporary_subject"
      ("id", "createdAt", "updatedAt", "version", "appInstanceId", "name", "teacher", "weight", "semesterId")
      SELECT
        "id", "createdAt", "updatedAt", "version", "appInstanceId", "name", "teacher", "weight", "semesterId"
      FROM "subject"
    `);

    await queryRunner.query(`DROP TABLE "subject"`);

    await queryRunner.query(
      `ALTER TABLE "temporary_subject" RENAME TO "subject"`,
    );

    console.log('Migration completed successfully');
  }
}
