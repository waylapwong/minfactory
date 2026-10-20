import { MinAdventBlockDto } from '../../../core/generated/model/min-advent-block-dto';

export interface MinAdventCalendar {
  completed: boolean;
  doors: MinAdventDoor[];
  id: string;
  published: boolean;
  recipientName: string;
  title: string;
  version: number;
  year: number;
}

export interface MinAdventDoor {
  blocks: MinAdventBlockDto[];
  day: number;
  status: 'EMPTY' | 'FILLED' | 'OPENED';
}

export interface MinAdventCalendarGroup {
  calendars: MinAdventCalendar[];
  year: number;
}
