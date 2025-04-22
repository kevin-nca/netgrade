import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initdb1745319232244 implements MigrationInterface {
  name = 'Initdb1745319232244';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.error('Running migration: ' + this.name);
    await queryRunner.query(`CREATE TABLE "school"
                             (
                               "id"            varchar PRIMARY KEY NOT NULL,
                               "createdAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "updatedAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "version"       integer             NOT NULL,
                               "appInstanceId" varchar(255),
                               "name"          varchar             NOT NULL,
                               "address"       varchar,
                               "type"          varchar
                             )`);
    await queryRunner.query(`CREATE TABLE "subject"
                             (
                               "id"            varchar PRIMARY KEY NOT NULL,
                               "createdAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "updatedAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "version"       integer             NOT NULL,
                               "appInstanceId" varchar(255),
                               "name"          varchar             NOT NULL,
                               "teacher"       varchar,
                               "description"   varchar(500),
                               "weight"        float                        DEFAULT (1),
                               "schoolId"      varchar             NOT NULL
                             )`);
    await queryRunner.query(`CREATE TABLE "grade"
                             (
                               "id"            varchar PRIMARY KEY NOT NULL,
                               "createdAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "updatedAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "version"       integer             NOT NULL,
                               "appInstanceId" varchar(255),
                               "score"         float               NOT NULL,
                               "weight"        float               NOT NULL DEFAULT (1),
                               "comment"       varchar(255),
                               "date"          date                NOT NULL,
                               "examId"        varchar             NOT NULL,
                               CONSTRAINT "REL_833d97df99639929e662be6bee" UNIQUE ("examId")
                             )`);
    await queryRunner.query(`CREATE TABLE "exam"
                             (
                               "id"            varchar PRIMARY KEY NOT NULL,
                               "createdAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "updatedAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "version"       integer             NOT NULL,
                               "appInstanceId" varchar(255),
                               "name"          varchar             NOT NULL,
                               "date"          date                NOT NULL,
                               "description"   varchar(500),
                               "weight"        float,
                               "isCompleted"   boolean             NOT NULL DEFAULT (0),
                               "subjectId"     varchar             NOT NULL,
                               "gradeId"       varchar,
                               CONSTRAINT "REL_4b76e266b87436037154f2c914" UNIQUE ("gradeId")
                             )`);
    await queryRunner.query(`CREATE TABLE "temporary_subject"
                             (
                               "id"            varchar PRIMARY KEY NOT NULL,
                               "createdAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "updatedAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "version"       integer             NOT NULL,
                               "appInstanceId" varchar(255),
                               "name"          varchar             NOT NULL,
                               "teacher"       varchar,
                               "description"   varchar(500),
                               "weight"        float                        DEFAULT (1),
                               "schoolId"      varchar             NOT NULL,
                               CONSTRAINT "FK_c59658ffb3910e021a307b44b3c" FOREIGN KEY ("schoolId") REFERENCES "school" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
                             )`);
    await queryRunner.query(`INSERT INTO "temporary_subject"("id", "createdAt", "updatedAt", "version", "appInstanceId",
                                                             "name", "teacher", "description", "weight", "schoolId")
                             SELECT "id",
                                    "createdAt",
                                    "updatedAt",
                                    "version",
                                    "appInstanceId",
                                    "name",
                                    "teacher",
                                    "description",
                                    "weight",
                                    "schoolId"
                             FROM "subject"`);
    await queryRunner.query(`DROP TABLE "subject"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_subject" RENAME TO "subject"`,
    );
    await queryRunner.query(`CREATE TABLE "temporary_grade"
                             (
                               "id"            varchar PRIMARY KEY NOT NULL,
                               "createdAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "updatedAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "version"       integer             NOT NULL,
                               "appInstanceId" varchar(255),
                               "score"         float               NOT NULL,
                               "weight"        float               NOT NULL DEFAULT (1),
                               "comment"       varchar(255),
                               "date"          date                NOT NULL,
                               "examId"        varchar             NOT NULL,
                               CONSTRAINT "REL_833d97df99639929e662be6bee" UNIQUE ("examId"),
                               CONSTRAINT "FK_833d97df99639929e662be6beee" FOREIGN KEY ("examId") REFERENCES "exam" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
                             )`);
    await queryRunner.query(`INSERT INTO "temporary_grade"("id", "createdAt", "updatedAt", "version", "appInstanceId",
                                                           "score", "weight", "comment", "date", "examId")
                             SELECT "id",
                                    "createdAt",
                                    "updatedAt",
                                    "version",
                                    "appInstanceId",
                                    "score",
                                    "weight",
                                    "comment",
                                    "date",
                                    "examId"
                             FROM "grade"`);
    await queryRunner.query(`DROP TABLE "grade"`);
    await queryRunner.query(`ALTER TABLE "temporary_grade" RENAME TO "grade"`);
    await queryRunner.query(`CREATE TABLE "temporary_exam"
                             (
                               "id"            varchar PRIMARY KEY NOT NULL,
                               "createdAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "updatedAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "version"       integer             NOT NULL,
                               "appInstanceId" varchar(255),
                               "name"          varchar             NOT NULL,
                               "date"          date                NOT NULL,
                               "description"   varchar(500),
                               "weight"        float,
                               "isCompleted"   boolean             NOT NULL DEFAULT (0),
                               "subjectId"     varchar             NOT NULL,
                               "gradeId"       varchar,
                               CONSTRAINT "REL_4b76e266b87436037154f2c914" UNIQUE ("gradeId"),
                               CONSTRAINT "FK_d0c14897766a526d7b52cd78977" FOREIGN KEY ("subjectId") REFERENCES "subject" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                               CONSTRAINT "FK_4b76e266b87436037154f2c914a" FOREIGN KEY ("gradeId") REFERENCES "grade" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
                             )`);
    await queryRunner.query(`INSERT INTO "temporary_exam"("id", "createdAt", "updatedAt", "version", "appInstanceId",
                                                          "name", "date", "description", "weight", "isCompleted",
                                                          "subjectId", "gradeId")
                             SELECT "id",
                                    "createdAt",
                                    "updatedAt",
                                    "version",
                                    "appInstanceId",
                                    "name",
                                    "date",
                                    "description",
                                    "weight",
                                    "isCompleted",
                                    "subjectId",
                                    "gradeId"
                             FROM "exam"`);
    await queryRunner.query(`DROP TABLE "exam"`);
    await queryRunner.query(`ALTER TABLE "temporary_exam" RENAME TO "exam"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "exam" RENAME TO "temporary_exam"`);
    await queryRunner.query(`CREATE TABLE "exam"
                             (
                               "id"            varchar PRIMARY KEY NOT NULL,
                               "createdAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "updatedAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "version"       integer             NOT NULL,
                               "appInstanceId" varchar(255),
                               "name"          varchar             NOT NULL,
                               "date"          date                NOT NULL,
                               "description"   varchar(500),
                               "weight"        float,
                               "isCompleted"   boolean             NOT NULL DEFAULT (0),
                               "subjectId"     varchar             NOT NULL,
                               "gradeId"       varchar,
                               CONSTRAINT "REL_4b76e266b87436037154f2c914" UNIQUE ("gradeId")
                             )`);
    await queryRunner.query(`INSERT INTO "exam"("id", "createdAt", "updatedAt", "version", "appInstanceId", "name",
                                                "date", "description", "weight", "isCompleted", "subjectId", "gradeId")
                             SELECT "id",
                                    "createdAt",
                                    "updatedAt",
                                    "version",
                                    "appInstanceId",
                                    "name",
                                    "date",
                                    "description",
                                    "weight",
                                    "isCompleted",
                                    "subjectId",
                                    "gradeId"
                             FROM "temporary_exam"`);
    await queryRunner.query(`DROP TABLE "temporary_exam"`);
    await queryRunner.query(`ALTER TABLE "grade" RENAME TO "temporary_grade"`);
    await queryRunner.query(`CREATE TABLE "grade"
                             (
                               "id"            varchar PRIMARY KEY NOT NULL,
                               "createdAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "updatedAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "version"       integer             NOT NULL,
                               "appInstanceId" varchar(255),
                               "score"         float               NOT NULL,
                               "weight"        float               NOT NULL DEFAULT (1),
                               "comment"       varchar(255),
                               "date"          date                NOT NULL,
                               "examId"        varchar             NOT NULL,
                               CONSTRAINT "REL_833d97df99639929e662be6bee" UNIQUE ("examId")
                             )`);
    await queryRunner.query(`INSERT INTO "grade"("id", "createdAt", "updatedAt", "version", "appInstanceId", "score",
                                                 "weight", "comment", "date", "examId")
                             SELECT "id",
                                    "createdAt",
                                    "updatedAt",
                                    "version",
                                    "appInstanceId",
                                    "score",
                                    "weight",
                                    "comment",
                                    "date",
                                    "examId"
                             FROM "temporary_grade"`);
    await queryRunner.query(`DROP TABLE "temporary_grade"`);
    await queryRunner.query(
      `ALTER TABLE "subject" RENAME TO "temporary_subject"`,
    );
    await queryRunner.query(`CREATE TABLE "subject"
                             (
                               "id"            varchar PRIMARY KEY NOT NULL,
                               "createdAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "updatedAt"     datetime            NOT NULL DEFAULT (datetime('now')),
                               "version"       integer             NOT NULL,
                               "appInstanceId" varchar(255),
                               "name"          varchar             NOT NULL,
                               "teacher"       varchar,
                               "description"   varchar(500),
                               "weight"        float                        DEFAULT (1),
                               "schoolId"      varchar             NOT NULL
                             )`);
    await queryRunner.query(`INSERT INTO "subject"("id", "createdAt", "updatedAt", "version", "appInstanceId", "name",
                                                   "teacher", "description", "weight", "schoolId")
                             SELECT "id",
                                    "createdAt",
                                    "updatedAt",
                                    "version",
                                    "appInstanceId",
                                    "name",
                                    "teacher",
                                    "description",
                                    "weight",
                                    "schoolId"
                             FROM "temporary_subject"`);
    await queryRunner.query(`DROP TABLE "temporary_subject"`);
    await queryRunner.query(`DROP TABLE "exam"`);
    await queryRunner.query(`DROP TABLE "grade"`);
    await queryRunner.query(`DROP TABLE "subject"`);
    await queryRunner.query(`DROP TABLE "school"`);
  }
}
