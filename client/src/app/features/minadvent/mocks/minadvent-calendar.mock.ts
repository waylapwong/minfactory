import { MinAdventCalendarDto } from '../../../core/generated';
import { MinAdventSharedCalendarDto } from '../../../core/generated/model/min-advent-shared-calendar-dto';
import { MinAdventCalendar } from '../models/minadvent-calendar.model';

export const MINADVENT_CALENDAR_DTO_MOCK: MinAdventCalendarDto = {
  completed: false,
  doors: [
    { blocks: [], day: 1, status: 'FILLED' },
    { blocks: [], day: 2, status: 'OPENED' },
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

export const MINADVENT_SHARED_CALENDAR_DTO_MOCK: MinAdventSharedCalendarDto = {
  title: 'Adventskalender',
  recipientName: 'Alex',
  year: 2026,
  version: 1,
  completed: false,
  doors: Array.from({ length: 24 }, (_, index) => ({
    day: index + 1,
    status: index === 0 ? 'FILLED' : 'EMPTY',
  })),
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

export function createMinAdventSharedCalendarDto(
  overrides: Partial<MinAdventSharedCalendarDto> = {},
): MinAdventSharedCalendarDto {
  return {
    ...MINADVENT_SHARED_CALENDAR_DTO_MOCK,
    ...overrides,
    doors: overrides.doors ?? MINADVENT_SHARED_CALENDAR_DTO_MOCK.doors.map((door) => ({ ...door })),
  };
}
