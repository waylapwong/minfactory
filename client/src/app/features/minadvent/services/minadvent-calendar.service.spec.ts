import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MINADVENT_CALENDAR_REPOSITORY_MOCK } from '../mocks/minadvent-calendar.repository.mock';
import { createMinAdventCalendarDto } from '../mocks/minadvent-calendar.mock';
import { MinAdventCalendarRepository } from '../repositories/minadvent-calendar.repository';
import { MinAdventCalendarService } from './minadvent-calendar.service';

describe('MinAdventCalendarService', () => {
  let service: MinAdventCalendarService;

  beforeEach(() => {
    MINADVENT_CALENDAR_REPOSITORY_MOCK.create.calls.reset();
    MINADVENT_CALENDAR_REPOSITORY_MOCK.get.calls.reset();
    MINADVENT_CALENDAR_REPOSITORY_MOCK.getAll.calls.reset();
    MINADVENT_CALENDAR_REPOSITORY_MOCK.update.calls.reset();

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
});
