import { signal } from '@angular/core';
import { MinAdventCalendar } from '../models/minadvent-calendar.model';

export const MINADVENT_CALENDARS_SIGNAL = signal<MinAdventCalendar[]>([]);

export const MINADVENT_CALENDAR_SERVICE_MOCK = {
  calendars: MINADVENT_CALENDARS_SIGNAL.asReadonly(),
  createCalendar: jasmine.createSpy('createCalendar'),
  deleteCalendar: jasmine.createSpy('deleteCalendar'),
  getCalendar: jasmine.createSpy('getCalendar'),
  getSharedCalendar: jasmine.createSpy('getSharedCalendar'),
  getSharedDoor: jasmine.createSpy('getSharedDoor'),
  openSharedDoor: jasmine.createSpy('openSharedDoor'),
  getSharing: jasmine.createSpy('getSharing'),
  loadCalendars: jasmine.createSpy('loadCalendars'),
  updateCalendar: jasmine.createSpy('updateCalendar'),
  updateDoor: jasmine.createSpy('updateDoor'),
  closeDoor: jasmine.createSpy('closeDoor'),
  updateSharing: jasmine.createSpy('updateSharing'),
  rotateSharingToken: jasmine.createSpy('rotateSharingToken'),
};
