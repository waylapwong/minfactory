import { MinAdventCalendarDto } from '../../../core/generated';
import { MinAdventCalendar } from '../models/minadvent-calendar.model';

export const MINADVENT_CALENDAR_DTO_MOCK: MinAdventCalendarDto = {
  completed: false,
  doors: [
    { day: 1, status: 'FILLED' },
    { day: 2, status: 'OPENED' },
  ],
  id: 'calendar-id',
  published: false,
  recipientName: 'Alex',
  title: 'Adventskalender',
  version: 1,
  year: 2026,
};

export const MINADVENT_CALENDAR_MOCK: MinAdventCalendar = {
  ...MINADVENT_CALENDAR_DTO_MOCK,
  doors: MINADVENT_CALENDAR_DTO_MOCK.doors.map((door) => ({ ...door })),
};

export function createMinAdventCalendar(overrides: Partial<MinAdventCalendar> = {}): MinAdventCalendar {
  return {
    ...MINADVENT_CALENDAR_MOCK,
    ...overrides,
    doors: overrides.doors ?? MINADVENT_CALENDAR_MOCK.doors.map((door) => ({ ...door })),
  };
}

export function createMinAdventCalendarDto(overrides: Partial<MinAdventCalendarDto> = {}): MinAdventCalendarDto {
  return {
    ...MINADVENT_CALENDAR_DTO_MOCK,
    ...overrides,
    doors: overrides.doors ?? MINADVENT_CALENDAR_DTO_MOCK.doors.map((door) => ({ ...door })),
  };
}
