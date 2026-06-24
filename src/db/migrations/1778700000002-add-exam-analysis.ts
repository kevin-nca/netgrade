import { QueryRunner } from 'typeorm';

export class AddExamAnalysis1778700000002 {
  name = 'AddExamAnalysis1778700000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exam" ADD COLUMN "pointsAchieved" float`,
    );
    await queryRunner.query(`ALTER TABLE "exam" ADD COLUMN "pointsMax" float`);
  }
}
