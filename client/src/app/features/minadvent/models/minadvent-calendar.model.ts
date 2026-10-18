export interface MinAdventCalendar {
  id: string;
  title: string;
  recipientName: string;
  year: number;
  version: number;
  published: boolean;
  completed: boolean;
  doors: { day: number; status: 'EMPTY' | 'FILLED' | 'OPENED' }[];
}

export interface MinAdventCalendarGroup {
  year: number;
  calendars: MinAdventCalendar[];
}