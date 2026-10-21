import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MinAdventDoorEntity } from './minadvent-door.entity';

@Entity({ name: 'minadvent_calendars' })
export class MinAdventCalendarEntity {
  @Column({ name: 'active_token', type: 'varchar', length: 64, nullable: true, unique: true })
  public activeToken!: string | null;
  @Column({ name: 'is_published', type: 'boolean', default: false })
  public isPublished!: boolean;
  @Column({ name: 'owner_id', type: 'varchar', length: 36 })
  public ownerId!: string;
  @Column({ name: 'recipient_name', type: 'varchar', length: 50 })
  public recipientName!: string;
  @Column({ type: 'varchar', length: 50 })
  public title!: string;
  @Column({ type: 'int', default: 1 })
  public version!: number;
  @Column({ type: 'int' })
  public year!: number;
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  public createdAt!: Date;
  @OneToMany(() => MinAdventDoorEntity, (door) => door.calendar)
  public doors!: MinAdventDoorEntity[];
  @PrimaryGeneratedColumn('uuid')
  public id!: string;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  public updatedAt!: Date;
}
