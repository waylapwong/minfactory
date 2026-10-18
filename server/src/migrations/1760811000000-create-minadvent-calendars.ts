import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMinAdventCalendars1760811000000 implements MigrationInterface {
  name = 'CreateMinAdventCalendars1760811000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE minadvent_calendars (
        id varchar(36) NOT NULL,
        owner_id varchar(36) NOT NULL,
        year int NOT NULL,
        title varchar(100) NOT NULL,
        recipient_name varchar(100) NOT NULL,
        version int NOT NULL DEFAULT 1,
        is_published tinyint NOT NULL DEFAULT 0,
        active_token varchar(64) NULL,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY UQ_minadvent_calendars_active_token (active_token),
        KEY IDX_minadvent_calendars_owner_year (owner_id, year),
        CONSTRAINT FK_minadvent_calendars_owner FOREIGN KEY (owner_id)
          REFERENCES minfactory_users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE minadvent_doors (
        id varchar(36) NOT NULL,
        calendar_id varchar(36) NOT NULL,
        day int NOT NULL,
        status varchar(10) NOT NULL DEFAULT 'EMPTY',
        PRIMARY KEY (id),
        UNIQUE KEY UQ_minadvent_doors_calendar_day (calendar_id, day),
        CONSTRAINT CHK_minadvent_doors_day CHECK (day BETWEEN 1 AND 24),
        CONSTRAINT FK_minadvent_doors_calendar FOREIGN KEY (calendar_id)
          REFERENCES minadvent_calendars(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE minadvent_doors');
    await queryRunner.query('DROP TABLE minadvent_calendars');
  }
}
