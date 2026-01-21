import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSemester1737400000000 implements MigrationInterface {
  name = 'AddSemester1737400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Running migration: ' + this.name);

    // Create semester table
    await queryRunner.query(`CREATE TABLE "semester"
                             (
                               "id"            varchar PRIMARY KEY NOT NULL,
                               "createdAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "updatedAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "version"       integer             NOT NULL,
                               "appInstanceId" varchar(255),
                               "year"          varchar             NOT NULL,
                               "schoolId"      varchar             NOT NULL,
                               CONSTRAINT "FK_semester_school" FOREIGN KEY ("schoolId") REFERENCES "school" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
                             )`);

    // Add semesterId to subject table
    await queryRunner.query(`CREATE TABLE "temporary_subject"
                             (
                               "id"            varchar PRIMARY KEY NOT NULL,
                               "createdAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "updatedAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "version"       integer             NOT NULL,
                               "appInstanceId" varchar(255),
                               "name"          varchar             NOT NULL,
                               "teacher"       varchar,
                               "weight"        float                        DEFAULT (1),
                               "schoolId"      varchar             NOT NULL,
                               "semesterId"    varchar,  -- Ohne NOT NULL!
                               CONSTRAINT "FK_c59658ffb3910e021a307b44b3c" FOREIGN KEY ("schoolId") REFERENCES "school" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                               CONSTRAINT "FK_subject_semester" FOREIGN KEY ("semesterId") REFERENCES "semester" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
                             )`);

    await queryRunner.query(`INSERT INTO "temporary_subject"("id", "createdAt", "updatedAt", "version", "appInstanceId",
                                                             "name", "teacher", "weight", "schoolId", "semesterId")
                             SELECT "id",
                                    "createdAt",
                                    "updatedAt",
                                    "version",
                                    "appInstanceId",
                                    "name",
                                    "teacher",
                                    "weight",
                                    "schoolId",
                                    NULL  -- NULL statt ''
                             FROM "subject"`);

    await queryRunner.query(`DROP TABLE "subject"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_subject" RENAME TO "subject"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove semesterId from subject
    await queryRunner.query(`CREATE TABLE "temporary_subject"
                             (
                               "id"            varchar PRIMARY KEY NOT NULL,
                               "createdAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "updatedAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "version"       integer             NOT NULL,
                               "appInstanceId" varchar(255),
                               "name"          varchar             NOT NULL,
                               "teacher"       varchar,
                               "weight"        float                        DEFAULT (1),
                               "schoolId"      varchar             NOT NULL,
                               CONSTRAINT "FK_c59658ffb3910e021a307b44b3c" FOREIGN KEY ("schoolId") REFERENCES "school" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
                             )`);

    await queryRunner.query(`INSERT INTO "temporary_subject"("id", "createdAt", "updatedAt", "version", "appInstanceId",
                                                             "name", "teacher", "weight", "schoolId")
                             SELECT "id",
                                    "createdAt",
                                    "updatedAt",
                                    "version",
                                    "appInstanceId",
                                    "name",
                                    "teacher",
                                    "weight",
                                    "schoolId"
                             FROM "subject"`);

    await queryRunner.query(`DROP TABLE "subject"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_subject" RENAME TO "subject"`,
    );

    // Drop semester table
    await queryRunner.query(`DROP TABLE "semester"`);
  }
}
