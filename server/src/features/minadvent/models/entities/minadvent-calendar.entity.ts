import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MinAdventDoorEntity } from './minadvent-door.entity';

@Entity({ name: 'minadvent_calendars' })
export class MinAdventCalendarEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ name: 'owner_id', type: 'varchar', length: 36 })
  public ownerId!: string;

  @Column({ type: 'int' })
  public year!: number;

  @Column({ type: 'varchar', length: 100 })
  public title!: string;

  @Column({ name: 'recipient_name', type: 'varchar', length: 100 })
  public recipientName!: string;

  @Column({ type: 'int', default: 1 })
  public version!: number;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  public isPublished!: boolean;

  @Column({ name: 'active_token', type: 'varchar', length: 64, nullable: true, unique: true })
  public activeToken!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  public createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  public updatedAt!: Date;

  @OneToMany(() => MinAdventDoorEntity, (door) => door.calendar)
  public doors!: MinAdventDoorEntity[];
}
