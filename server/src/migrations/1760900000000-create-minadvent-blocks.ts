import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMinAdventBlocks1760900000000 implements MigrationInterface {
  name = 'CreateMinAdventBlocks1760900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE minadvent_blocks (
        id varchar(36) NOT NULL,
        door_id varchar(36) NOT NULL,
        position int NOT NULL,
        type varchar(10) NOT NULL,
        text longtext NULL,
        title varchar(100) NULL,
        url varchar(2048) NULL,
        description varchar(2000) NULL,
        PRIMARY KEY (id),
        UNIQUE KEY UQ_minadvent_blocks_door_position (door_id, position),
        CONSTRAINT CHK_minadvent_blocks_position CHECK (position BETWEEN 1 AND 10),
        CONSTRAINT FK_minadvent_blocks_door FOREIGN KEY (door_id)
          REFERENCES minadvent_doors(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE minadvent_blocks');
  }
}
