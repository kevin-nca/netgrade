import { QueryRunner } from 'typeorm';

export class AddFkSemesterSchool1771848100000 {
  name = 'AddFkSemesterSchool1771848100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
      INSERT INTO "temporary_semester" ("id", "createdAt", "updatedAt", "version", "appInstanceId", "name", "startDate", "endDate", "schoolId")
      SELECT "id", "createdAt", "updatedAt", "version", "appInstanceId", "name", "startDate", "endDate", "schoolId"
      FROM "semester"
    `);
    await queryRunner.query(`DROP TABLE "semester"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_semester" RENAME TO "semester"`,
    );
  }
}
