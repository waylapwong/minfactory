export const MINADVENT_CALENDAR_REPOSITORY_MOCK: {
  create: jasmine.Spy<jasmine.Func>;
  delete: jasmine.Spy<jasmine.Func>;
  get: jasmine.Spy<jasmine.Func>;
  getAll: jasmine.Spy<jasmine.Func>;
  getSharedCalendar: jasmine.Spy<jasmine.Func>;
  update: jasmine.Spy<jasmine.Func>;
  updateDoor: jasmine.Spy<jasmine.Func>;
  updateDoorStatus: jasmine.Spy<jasmine.Func>;
} = {
  create: jasmine.createSpy('create'),
  delete: jasmine.createSpy('delete'),
  get: jasmine.createSpy('get'),
  getAll: jasmine.createSpy('getAll'),
  getSharedCalendar: jasmine.createSpy('getSharedCalendar'),
  update: jasmine.createSpy('update'),
  updateDoor: jasmine.createSpy('updateDoor'),
  updateDoorStatus: jasmine.createSpy('updateDoorStatus'),
};
