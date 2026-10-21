import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MinAdventBlockType } from '../enums/minadvent-block-type.enum';
import { MinAdventDoorEntity } from './minadvent-door.entity';

@Entity({ name: 'minadvent_blocks' })
export class MinAdventBlockEntity {
  @Column({ name: 'description', type: 'varchar', length: 200, nullable: true })
  public description!: string | null;
  @Column({ name: 'door_id', type: 'varchar', length: 36 })
  public doorId!: string;
  @Column({ name: 'position', type: 'int' })
  public position!: number;
  @Column({ name: 'text', type: 'longtext', nullable: true })
  public text!: string | null;
  @Column({ name: 'title', type: 'varchar', length: 50, nullable: true })
  public title!: string | null;
  @Column({ name: 'type', type: 'varchar', length: 10 })
  public type!: MinAdventBlockType;
  @Column({ name: 'url', type: 'varchar', length: 50, nullable: true })
  public url!: string | null;
  @ManyToOne(() => MinAdventDoorEntity, (door) => door.blocks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'door_id' })
  public door!: MinAdventDoorEntity;
  @PrimaryGeneratedColumn('uuid')
  public id!: string;
}
