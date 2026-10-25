import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MinAdventCalendarEntity } from './minadvent-calendar.entity';
import { MinAdventDoorStatus } from '../enums/minadvent-door-status.enum';
import { MinAdventBlockEntity } from './minadvent-block.entity';

@Entity({ name: 'minadvent_doors' })
export class MinAdventDoorEntity {
  @Column({ name: 'calendar_id', type: 'varchar', length: 36 })
  public calendarId: string;
  @Column({ type: 'int' })
  public day: number;
  @Column({ type: 'varchar', length: 10, default: MinAdventDoorStatus.Empty })
  public status: MinAdventDoorStatus;
  @ManyToOne(() => MinAdventCalendarEntity, (calendar) => calendar.doors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'calendar_id' })
  public calendar: MinAdventCalendarEntity;
  @OneToMany(() => MinAdventBlockEntity, (block) => block.door)
  public blocks: MinAdventBlockEntity[];
  @PrimaryGeneratedColumn('uuid')
  public id: string;
}
