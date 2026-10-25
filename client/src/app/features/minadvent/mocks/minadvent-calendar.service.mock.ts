import { signal } from '@angular/core';
import { MinAdventCalendar } from '../models/minadvent-calendar.model';

export const MINADVENT_CALENDARS_SIGNAL: import('@angular/core').WritableSignal<MinAdventCalendar[]> = signal<
  MinAdventCalendar[]
>([]);

export const MINADVENT_CALENDAR_SERVICE_MOCK: {
  calendars: import('@angular/core').Signal<MinAdventCalendar[]>;
  createCalendar: jasmine.Spy<jasmine.Func>;
  deleteCalendar: jasmine.Spy<jasmine.Func>;
  getCalendar: jasmine.Spy<jasmine.Func>;
  getSharedCalendar: jasmine.Spy<jasmine.Func>;
  getSharedDoor: jasmine.Spy<jasmine.Func>;
  openSharedDoor: jasmine.Spy<jasmine.Func>;
  getSharing: jasmine.Spy<jasmine.Func>;
  loadCalendars: jasmine.Spy<jasmine.Func>;
  updateCalendar: jasmine.Spy<jasmine.Func>;
  updateDoor: jasmine.Spy<jasmine.Func>;
  closeDoor: jasmine.Spy<jasmine.Func>;
  updateSharing: jasmine.Spy<jasmine.Func>;
  rotateSharingToken: jasmine.Spy<jasmine.Func>;
} = {
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
