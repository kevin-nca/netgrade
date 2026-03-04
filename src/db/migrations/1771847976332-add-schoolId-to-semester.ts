import { QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class AddSchoolIdToSemester1771847976332 {
  name = 'AddSchoolIdToSemester1771847976332';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columns = await queryRunner.query(`PRAGMA table_info("semester")`);
    const hasSchoolId = columns.some(
      (col: { name: string }) => col.name === 'schoolId',
    );
    if (!hasSchoolId) {
      await queryRunner.query(`
        ALTER TABLE "semester" ADD COLUMN "schoolId" varchar
      `);
    }

    // 2. Assign schoolId from existing subject relations
    await queryRunner.query(`
      UPDATE "semester"
      SET "schoolId" = (
        SELECT "schoolId" FROM "subject"
        WHERE "subject"."semesterId" = "semester"."id"
        LIMIT 1
        )
      WHERE EXISTS (
        SELECT 1 FROM "subject"
        WHERE "subject"."semesterId" = "semester"."id"
        )
    `);

    // 3. For schools without a semester yet, create a default semester
    const schools: { id: string }[] = await queryRunner.query(`
      SELECT "id" FROM "school"
      WHERE "id" NOT IN (
        SELECT DISTINCT "schoolId" FROM "semester" WHERE "schoolId" IS NOT NULL
      )
    `);

    for (const school of schools) {
      const year = new Date().getFullYear();
      await queryRunner.query(
        `INSERT INTO "semester" ("id", "name", "startDate", "endDate", "version", "schoolId")
         VALUES (?, ?, ?, ?, 1, ?)`,
        [
          uuidv4(),
          `${year}/${year + 1}`,
          `${year}-08-15`,
          `${year + 1}-07-31`,
          school.id,
        ],
      );
    }

    // 4. Fallback: any semester still without a schoolId gets the first school
    await queryRunner.query(`
      UPDATE "semester"
      SET "schoolId" = (SELECT "id" FROM "school" LIMIT 1)
      WHERE "schoolId" IS NULL
    `);
    // 5. Remove schoolId from subject (replaced by semesterId → temporary table
    //    required because schoolId has a FOREIGN KEY constraint)
    const subjectColumns = await queryRunner.query(
      `PRAGMA table_info("subject")`,
    );
    const subjectHasSchoolId = subjectColumns.some(
      (col: { name: string }) => col.name === 'schoolId',
    );
    if (subjectHasSchoolId) {
      // Create new subject table without schoolId column
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

      // Copy all existing data except schoolId
      await queryRunner.query(`
        INSERT INTO "temporary_subject"
        ("id", "createdAt", "updatedAt", "version", "appInstanceId", "name", "teacher", "weight", "semesterId")
        SELECT "id", "createdAt", "updatedAt", "version", "appInstanceId", "name", "teacher", "weight", "semesterId"
        FROM "subject"
      `);

      // Replace old table with new one
      await queryRunner.query(`DROP TABLE "subject"`);
      await queryRunner.query(
        `ALTER TABLE "temporary_subject" RENAME TO "subject"`,
      );
    }

    // 6. Remove examId from grade
    const gradeColumns = await queryRunner.query(`PRAGMA table_info("grade")`);
    const gradeHasExamId = gradeColumns.some(
      (col: { name: string }) => col.name === 'examId',
    );
    if (gradeHasExamId) {
      await queryRunner.query(`
        CREATE TABLE "temporary_grade" (
                                         "id"            varchar PRIMARY KEY NOT NULL,
                                         "createdAt"     datetime NOT NULL DEFAULT (datetime('now')),
                                         "updatedAt"     datetime NOT NULL DEFAULT (datetime('now')),
                                         "version"       integer NOT NULL DEFAULT 1,
                                         "appInstanceId" varchar(255),
                                         "score"         float NOT NULL,
                                         "weight"        float NOT NULL DEFAULT (1),
                                         "comment"       varchar(255),
                                         "date"          date NOT NULL
        )
      `);

      // Copy all existing data except examId
      await queryRunner.query(`
        INSERT INTO "temporary_grade"
        ("id", "createdAt", "updatedAt", "version", "appInstanceId", "score", "weight", "comment", "date")
        SELECT "id", "createdAt", "updatedAt", "version", "appInstanceId", "score", "weight", "comment", "date"
        FROM "grade"
      `);

      // Replace old table with new one
      await queryRunner.query(`DROP TABLE "grade"`);
      await queryRunner.query(
        `ALTER TABLE "temporary_grade" RENAME TO "grade"`,
      );
    }
  }
}
