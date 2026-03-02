import { QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class AddSchoolIdToSemester1771847976330 {
  name = 'AddSchoolIdToSemester1771847976330';

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
  }
}
