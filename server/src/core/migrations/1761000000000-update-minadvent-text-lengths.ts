import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMinAdventTextLengths1761000000000 implements MigrationInterface {
  name = 'UpdateMinAdventTextLengths1761000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const oversizedValues = (await queryRunner.query(`
      SELECT
        (SELECT COUNT(*) FROM minadvent_calendars WHERE CHAR_LENGTH(title) > 50) +
        (SELECT COUNT(*) FROM minadvent_calendars WHERE CHAR_LENGTH(recipient_name) > 50) +
        (SELECT COUNT(*) FROM minadvent_blocks WHERE CHAR_LENGTH(title) > 50) +
        (SELECT COUNT(*) FROM minadvent_blocks WHERE CHAR_LENGTH(url) > 50) +
        (SELECT COUNT(*) FROM minadvent_blocks WHERE CHAR_LENGTH(description) > 200) AS count
    `)) as Array<{ count: number }>;
    if (Number(oversizedValues[0]?.count ?? 0) > 0) {
      throw new Error('MinAdvent data exceeds the new text length limits; shorten existing values before migrating.');
    }

    await queryRunner.query('ALTER TABLE minadvent_calendars MODIFY title varchar(50) NOT NULL');
    await queryRunner.query('ALTER TABLE minadvent_calendars MODIFY recipient_name varchar(50) NOT NULL');
    await queryRunner.query('ALTER TABLE minadvent_blocks MODIFY title varchar(50) NULL');
    await queryRunner.query('ALTER TABLE minadvent_blocks MODIFY url varchar(50) NULL');
    await queryRunner.query('ALTER TABLE minadvent_blocks MODIFY description varchar(200) NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE minadvent_blocks MODIFY description varchar(2000) NULL');
    await queryRunner.query('ALTER TABLE minadvent_blocks MODIFY url varchar(2048) NULL');
    await queryRunner.query('ALTER TABLE minadvent_blocks MODIFY title varchar(100) NULL');
    await queryRunner.query('ALTER TABLE minadvent_calendars MODIFY recipient_name varchar(100) NOT NULL');
    await queryRunner.query('ALTER TABLE minadvent_calendars MODIFY title varchar(100) NOT NULL');
  }
}
