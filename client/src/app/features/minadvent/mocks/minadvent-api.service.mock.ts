export const MINADVENT_API_SERVICE_MOCK: {
  createMinAdventCalendar: jasmine.Spy<jasmine.Func>;
  deleteMinAdventCalendar: jasmine.Spy<jasmine.Func>;
  getMinAdventCalendar: jasmine.Spy<jasmine.Func>;
  getMinAdventCalendars: jasmine.Spy<jasmine.Func>;
  getMinAdventSharedCalendar: jasmine.Spy<jasmine.Func>;
  getMinAdventSharedDoor: jasmine.Spy<jasmine.Func>;
  openMinAdventSharedDoor: jasmine.Spy<jasmine.Func>;
  updateMinAdventCalendar: jasmine.Spy<jasmine.Func>;
  updateMinAdventDoor: jasmine.Spy<jasmine.Func>;
  updateMinAdventDoorStatus: jasmine.Spy<jasmine.Func>;
} = {
  createMinAdventCalendar: jasmine.createSpy('createMinAdventCalendar'),
  deleteMinAdventCalendar: jasmine.createSpy('deleteMinAdventCalendar'),
  getMinAdventCalendar: jasmine.createSpy('getMinAdventCalendar'),
  getMinAdventCalendars: jasmine.createSpy('getMinAdventCalendars'),
  getMinAdventSharedCalendar: jasmine.createSpy('getMinAdventSharedCalendar'),
  getMinAdventSharedDoor: jasmine.createSpy('getMinAdventSharedDoor'),
  openMinAdventSharedDoor: jasmine.createSpy('openMinAdventSharedDoor'),
  updateMinAdventCalendar: jasmine.createSpy('updateMinAdventCalendar'),
  updateMinAdventDoor: jasmine.createSpy('updateMinAdventDoor'),
  updateMinAdventDoorStatus: jasmine.createSpy('updateMinAdventDoorStatus'),
};
