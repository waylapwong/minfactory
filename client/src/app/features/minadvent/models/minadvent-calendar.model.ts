export interface MinAdventCalendar {
  completed: boolean;
  doors: { day: number; status: 'EMPTY' | 'FILLED' | 'OPENED' }[];
  id: string;
  published: boolean;
  recipientName: string;
  title: string;
  version: number;
  year: number;
}

export interface MinAdventCalendarGroup {
  calendars: MinAdventCalendar[];
  year: number;
}
