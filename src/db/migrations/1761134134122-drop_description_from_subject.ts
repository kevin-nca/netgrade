import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropDescriptionFromSubject1761134134122 implements MigrationInterface {
    name = 'Initdb1745319232244';

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.error('Running migration: ' + this.name);
        await queryRunner.query(`
            ALTER TABLE "subject"
            DROP COLUMN "description"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "subject"
            ADD "description" varchar(500)
        `);
    }
}
