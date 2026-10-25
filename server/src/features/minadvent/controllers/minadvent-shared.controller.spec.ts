import { MinAdventSharedCalendarServiceMock } from '../mocks/minadvent-shared-calendar.service.mock';
import { MinAdventCalendarService } from '../services/minadvent-calendar.service';
import { MinAdventSharedController } from './minadvent-shared.controller';

describe('MinAdventSharedController', () => {
  let controller: MinAdventSharedController;
  let calendarService: MinAdventSharedCalendarServiceMock;

  beforeEach(() => {
    calendarService = new MinAdventSharedCalendarServiceMock();
    controller = new MinAdventSharedController(calendarService as unknown as MinAdventCalendarService);
  });

  describe('get()', () => {
    it('returns the shared calendar for a valid token', async () => {
      const response: never = { title: 'December' } as never;
      calendarService.getSharedCalendar.mockResolvedValue(response);

      await expect(controller.get('a'.repeat(64))).resolves.toBe(response);
      expect(calendarService.getSharedCalendar).toHaveBeenCalledWith('a'.repeat(64));
    });

    it('returns a neutral 404 for a token whose calendar was deleted', async () => {
      await expect(controller.get('b'.repeat(64))).rejects.toMatchObject({
        status: 404,
        response: {
          code: 'SHARED_CALENDAR_UNAVAILABLE',
          message: 'Dieser Adventskalender ist nicht verfügbar.',
        },
      });
    });
  });

  describe('getDoor()', () => {
    it('returns the same neutral 404 error for an unavailable token', async () => {
      await expect(controller.getDoor('b'.repeat(64), 1)).rejects.toMatchObject({
        status: 404,
        response: {
          code: 'SHARED_CALENDAR_UNAVAILABLE',
          message: 'Dieser Adventskalender ist nicht verfügbar.',
        },
      });
    });
  });

  describe('openDoor()', () => {
    it('returns the same neutral 404 error for an unavailable token', async () => {
      await expect(controller.openDoor('b'.repeat(64), 1, { expectedVersion: 1 })).rejects.toMatchObject({
        status: 404,
        response: {
          code: 'SHARED_CALENDAR_UNAVAILABLE',
          message: 'Dieser Adventskalender ist nicht verfügbar.',
        },
      });
    });
  });
});
