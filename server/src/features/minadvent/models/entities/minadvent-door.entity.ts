import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MinAdventCalendarEntity } from './minadvent-calendar.entity';

export enum MinAdventDoorStatus {
  Empty = 'EMPTY',
  Filled = 'FILLED',
  Opened = 'OPENED',
}

@Entity({ name: 'minadvent_doors' })
export class MinAdventDoorEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ name: 'calendar_id', type: 'varchar', length: 36 })
  public calendarId!: string;

  @ManyToOne(() => MinAdventCalendarEntity, (calendar) => calendar.doors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'calendar_id' })
  public calendar!: MinAdventCalendarEntity;

  @Column({ type: 'int' })
  public day!: number;

  @Column({ type: 'varchar', length: 10, default: MinAdventDoorStatus.Empty })
  public status!: MinAdventDoorStatus;
}
