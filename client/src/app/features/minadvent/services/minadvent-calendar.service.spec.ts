import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createMinAdventCalendarDto, createMinAdventSharedCalendarDto } from '../mocks/minadvent-calendar.mock';
import { MINADVENT_CALENDAR_REPOSITORY_MOCK } from '../mocks/minadvent-calendar.repository.mock';
import { MinAdventCalendarRepository } from '../repositories/minadvent-calendar.repository';
import { MinAdventCalendarService } from './minadvent-calendar.service';

describe('MinAdventCalendarService', () => {
  let service: MinAdventCalendarService;

  beforeEach(() => {
    MINADVENT_CALENDAR_REPOSITORY_MOCK.create.calls.reset();
    MINADVENT_CALENDAR_REPOSITORY_MOCK.get.calls.reset();
    MINADVENT_CALENDAR_REPOSITORY_MOCK.getAll.calls.reset();
    MINADVENT_CALENDAR_REPOSITORY_MOCK.getSharedCalendar.calls.reset();
    MINADVENT_CALENDAR_REPOSITORY_MOCK.update.calls.reset();
    MINADVENT_CALENDAR_REPOSITORY_MOCK.updateDoor.calls.reset();
    MINADVENT_CALENDAR_REPOSITORY_MOCK.updateDoorStatus.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinAdventCalendarService,
        { provide: MinAdventCalendarRepository, useValue: MINADVENT_CALENDAR_REPOSITORY_MOCK },
      ],
    });

    service = TestBed.inject(MinAdventCalendarService);
  });

  describe('constructor', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('createCalendar()', () => {
    it('should map a created calendar and add it to the start of the cache', async () => {
      MINADVENT_CALENDAR_REPOSITORY_MOCK.getAll.and.resolveTo([createMinAdventCalendarDto({ id: 'existing' })]);
      MINADVENT_CALENDAR_REPOSITORY_MOCK.create.and.resolveTo(createMinAdventCalendarDto({ id: 'created' }));
      await service.loadCalendars();

      const result = await service.createCalendar({ recipientName: 'Alex', title: 'Neu', year: 2026 });

      expect(MINADVENT_CALENDAR_REPOSITORY_MOCK.create).toHaveBeenCalledWith({
        recipientName: 'Alex',
        title: 'Neu',
        year: 2026,
      });
      expect(result.id).toBe('created');
      expect(service.calendars().map((calendar) => calendar.id)).toEqual(['created', 'existing']);
    });
  });

  describe('getCalendar()', () => {
    it('should get and map a calendar by id', async () => {
      MINADVENT_CALENDAR_REPOSITORY_MOCK.get.and.resolveTo(createMinAdventCalendarDto());

      const result = await service.getCalendar('calendar-id');

      expect(MINADVENT_CALENDAR_REPOSITORY_MOCK.get).toHaveBeenCalledWith('calendar-id');
      expect(result.id).toBe('calendar-id');
    });
  });

  describe('getSharedCalendar()', () => {
    it('should pass the shared token to the repository', async () => {
      MINADVENT_CALENDAR_REPOSITORY_MOCK.getSharedCalendar.and.resolveTo(createMinAdventSharedCalendarDto());

      const result = await service.getSharedCalendar('shared-token');

      expect(MINADVENT_CALENDAR_REPOSITORY_MOCK.getSharedCalendar).toHaveBeenCalledWith('shared-token');
      expect(result.title).toBe('Adventskalender');
    });
  });

  describe('loadCalendars()', () => {
    it('should load and map calendars into the signal cache', async () => {
      const first = createMinAdventCalendarDto({ id: 'first-calendar' });
      const second = createMinAdventCalendarDto({ id: 'second-calendar' });
      MINADVENT_CALENDAR_REPOSITORY_MOCK.getAll.and.resolveTo([first, second]);

      await service.loadCalendars();

      expect(MINADVENT_CALENDAR_REPOSITORY_MOCK.getAll).toHaveBeenCalled();
      expect(service.calendars().map((calendar) => calendar.id)).toEqual(['first-calendar', 'second-calendar']);
    });
  });

  describe('updateCalendar()', () => {
    it('should replace the matching cached calendar when updating it', async () => {
      MINADVENT_CALENDAR_REPOSITORY_MOCK.getAll.and.resolveTo([createMinAdventCalendarDto()]);
      MINADVENT_CALENDAR_REPOSITORY_MOCK.update.and.resolveTo(createMinAdventCalendarDto({ title: 'Aktualisiert' }));
      await service.loadCalendars();

      const result = await service.updateCalendar('calendar-id', { expectedVersion: 1, title: 'Aktualisiert' });

      expect(MINADVENT_CALENDAR_REPOSITORY_MOCK.update).toHaveBeenCalledWith('calendar-id', {
        expectedVersion: 1,
        title: 'Aktualisiert',
      });
      expect(result.title).toBe('Aktualisiert');
      expect(service.calendars()).toHaveSize(1);
      expect(service.calendars()[0].title).toBe('Aktualisiert');
    });
  });

  describe('updateDoor()', () => {
    it('adopts the door status and global version in the calendar cache', async () => {
      MINADVENT_CALENDAR_REPOSITORY_MOCK.getAll.and.resolveTo([createMinAdventCalendarDto()]);
      MINADVENT_CALENDAR_REPOSITORY_MOCK.updateDoor.and.resolveTo({
        completed: false,
        day: 1,
        status: 'FILLED',
        version: 2,
      });
      await service.loadCalendars();

      const result = await service.updateDoor('calendar-id', 1, {
        blocks: [{ position: 1, text: '<p>Surprise</p>', type: 'TEXT' }],
        expectedVersion: 1,
      });

      expect(MINADVENT_CALENDAR_REPOSITORY_MOCK.updateDoor).toHaveBeenCalledWith('calendar-id', 1, {
        blocks: [{ position: 1, text: '<p>Surprise</p>', type: 'TEXT' }],
        expectedVersion: 1,
      });
      expect(result.version).toBe(2);
      expect(service.calendars()[0].version).toBe(2);
      expect(service.calendars()[0].doors[0].blocks).toEqual([{ position: 1, text: '<p>Surprise</p>', type: 'TEXT' }]);
    });
  });

  describe('closeDoor()', () => {
    it('sets the door back to FILLED and updates the cached version', async () => {
      MINADVENT_CALENDAR_REPOSITORY_MOCK.getAll.and.resolveTo([createMinAdventCalendarDto()]);
      MINADVENT_CALENDAR_REPOSITORY_MOCK.updateDoorStatus.and.resolveTo({
        completed: false,
        day: 2,
        status: 'FILLED',
        version: 2,
      });
      await service.loadCalendars();

      const result = await service.closeDoor('calendar-id', 2, 1);

      expect(MINADVENT_CALENDAR_REPOSITORY_MOCK.updateDoorStatus).toHaveBeenCalledWith('calendar-id', 2, 1);
      expect(result.status).toBe('FILLED');
      expect(service.calendars()[0].doors.find((door) => door.day === 2)?.status).toBe('FILLED');
      expect(service.calendars()[0].version).toBe(2);
    });
  });
});
