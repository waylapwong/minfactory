import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MinAdventApiService } from '../../../core/generated';
import { MINADVENT_API_SERVICE_MOCK } from '../mocks/minadvent-api.service.mock';
import { MINADVENT_CALENDAR_DTO_MOCK, MINADVENT_SHARED_CALENDAR_DTO_MOCK } from '../mocks/minadvent-calendar.mock';
import { MinAdventCalendarRepository } from './minadvent-calendar.repository';

describe('MinAdventCalendarRepository', () => {
  let repository: MinAdventCalendarRepository;

  beforeEach(() => {
    MINADVENT_API_SERVICE_MOCK.createMinAdventCalendar.calls.reset();
    MINADVENT_API_SERVICE_MOCK.getMinAdventCalendar.calls.reset();
    MINADVENT_API_SERVICE_MOCK.getMinAdventCalendars.calls.reset();
    MINADVENT_API_SERVICE_MOCK.getMinAdventSharedCalendar.calls.reset();
    MINADVENT_API_SERVICE_MOCK.getMinAdventSharedDoor.calls.reset();
    MINADVENT_API_SERVICE_MOCK.openMinAdventSharedDoor.calls.reset();
    MINADVENT_API_SERVICE_MOCK.updateMinAdventCalendar.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinAdventCalendarRepository,
        { provide: MinAdventApiService, useValue: MINADVENT_API_SERVICE_MOCK },
      ],
    });

    repository = TestBed.inject(MinAdventCalendarRepository);
  });

  describe('constructor', () => {
    it('should be created', () => {
      expect(repository).toBeTruthy();
    });
  });

  describe('create()', () => {
    it('should create a calendar through the API service', async () => {
      MINADVENT_API_SERVICE_MOCK.createMinAdventCalendar.and.returnValue(of(MINADVENT_CALENDAR_DTO_MOCK));

      const result = await repository.create({ recipientName: 'Alex', title: 'Adventskalender', year: 2026 });

      expect(MINADVENT_API_SERVICE_MOCK.createMinAdventCalendar).toHaveBeenCalledWith({
        recipientName: 'Alex',
        title: 'Adventskalender',
        year: 2026,
      });
      expect(result).toBe(MINADVENT_CALENDAR_DTO_MOCK);
    });
  });

  describe('get()', () => {
    it('should get a calendar by id through the API service', async () => {
      MINADVENT_API_SERVICE_MOCK.getMinAdventCalendar.and.returnValue(of(MINADVENT_CALENDAR_DTO_MOCK));

      const result = await repository.get('calendar-id');

      expect(MINADVENT_API_SERVICE_MOCK.getMinAdventCalendar).toHaveBeenCalledWith('calendar-id');
      expect(result).toBe(MINADVENT_CALENDAR_DTO_MOCK);
    });
  });

  describe('getAll()', () => {
    it('should get all calendars through the API service', async () => {
      MINADVENT_API_SERVICE_MOCK.getMinAdventCalendars.and.returnValue(of([MINADVENT_CALENDAR_DTO_MOCK]));

      const result = await repository.getAll();

      expect(MINADVENT_API_SERVICE_MOCK.getMinAdventCalendars).toHaveBeenCalled();
      expect(result).toEqual([MINADVENT_CALENDAR_DTO_MOCK]);
    });
  });

  describe('getSharedCalendar()', () => {
    it('should fetch a shared calendar by token through the API service', async () => {
      MINADVENT_API_SERVICE_MOCK.getMinAdventSharedCalendar.and.returnValue(of(MINADVENT_SHARED_CALENDAR_DTO_MOCK));

      const result = await repository.getSharedCalendar('shared-token');

      expect(MINADVENT_API_SERVICE_MOCK.getMinAdventSharedCalendar).toHaveBeenCalledWith('shared-token');
      expect(result).toBe(MINADVENT_SHARED_CALENDAR_DTO_MOCK);
    });
  });

  describe('getSharedDoor()', () => {
    it('gets content through the generated API service', async () => {
      const response = { day: 2, status: 'OPENED', blocks: [] } as never;
      MINADVENT_API_SERVICE_MOCK.getMinAdventSharedDoor.and.returnValue(of(response));

      await expectAsync(repository.getSharedDoor('shared-token', 2)).toBeResolvedTo(response);
      expect(MINADVENT_API_SERVICE_MOCK.getMinAdventSharedDoor).toHaveBeenCalledWith('shared-token', 2);
    });
  });

  describe('openSharedDoor()', () => {
    it('opens content through the generated API service with the current version', async () => {
      const response = {
        day: 2,
        status: 'OPENED',
        version: 3,
        completed: false,
        firstOpened: true,
        blocks: [],
      } as never;
      MINADVENT_API_SERVICE_MOCK.openMinAdventSharedDoor.and.returnValue(of(response));

      await expectAsync(repository.openSharedDoor('shared-token', 2, 2)).toBeResolvedTo(response);
      expect(MINADVENT_API_SERVICE_MOCK.openMinAdventSharedDoor).toHaveBeenCalledWith('shared-token', 2, {
        expectedVersion: 2,
      });
    });
  });

  describe('update()', () => {
    it('should update a calendar by id through the API service', async () => {
      const input = { expectedVersion: 1, title: 'Neuer Titel' };
      MINADVENT_API_SERVICE_MOCK.updateMinAdventCalendar.and.returnValue(of(MINADVENT_CALENDAR_DTO_MOCK));

      const result = await repository.update('calendar-id', input);

      expect(MINADVENT_API_SERVICE_MOCK.updateMinAdventCalendar).toHaveBeenCalledWith('calendar-id', input);
      expect(result).toBe(MINADVENT_CALENDAR_DTO_MOCK);
    });
  });
});
