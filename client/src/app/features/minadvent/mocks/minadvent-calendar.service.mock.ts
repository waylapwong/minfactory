import { signal } from '@angular/core';
import { MinAdventCalendar } from '../models/minadvent-calendar.model';

export const MINADVENT_CALENDARS_SIGNAL = signal<MinAdventCalendar[]>([]);

export const MINADVENT_CALENDAR_SERVICE_MOCK = {
  calendars: MINADVENT_CALENDARS_SIGNAL.asReadonly(),
  createCalendar: jasmine.createSpy('createCalendar'),
  getCalendar: jasmine.createSpy('getCalendar'),
  loadCalendars: jasmine.createSpy('loadCalendars'),
  updateCalendar: jasmine.createSpy('updateCalendar'),
};
