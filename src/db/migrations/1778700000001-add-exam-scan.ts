import { QueryRunner } from 'typeorm';

export class AddExamScan1778700000001 {
  name = 'AddExamScan1778700000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "exam_scan"`);

    await queryRunner.query(`
      CREATE TABLE "exam_scan" (
        "id" varchar PRIMARY KEY NOT NULL,
        "examId" varchar NOT NULL,
        "photoPath" varchar(255) NOT NULL,
        "appInstanceId" varchar(255) NOT NULL DEFAULT '',
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
        "version" int NOT NULL DEFAULT 1,
        FOREIGN KEY ("examId") REFERENCES "exam"("id") ON DELETE CASCADE
      )
    `);
  }
}
