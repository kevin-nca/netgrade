import { QueryRunner } from 'typeorm';

export class AddPhotoPathToExam1765400000004 {
  name = 'AddPhotoPathToExam1765400000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "exam" ADD COLUMN "photoPath" varchar(255)
    `);
  }
}
