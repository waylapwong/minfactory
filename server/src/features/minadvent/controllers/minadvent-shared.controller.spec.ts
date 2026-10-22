import { Test, TestingModule } from '@nestjs/testing';
import { MinAdventSharedThrottlerGuard } from '../guards/minadvent-shared-throttler.guard';
import { MINADVENT_SHARED_CALENDAR_SERVICE_MOCK } from '../mocks/minadvent-shared-calendar.service.mock';
import { MINADVENT_SHARED_THROTTLER_GUARD_MOCK } from '../mocks/minadvent-shared-throttler.guard.mock';
import { MinAdventCalendarService } from '../services/minadvent-calendar.service';
import { MinAdventSharedController } from './minadvent-shared.controller';

describe('MinAdventSharedController', () => {
  let controller: MinAdventSharedController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinAdventSharedController],
      providers: [{ provide: MinAdventCalendarService, useValue: MINADVENT_SHARED_CALENDAR_SERVICE_MOCK }],
    })
      .overrideGuard(MinAdventSharedThrottlerGuard)
      .useValue(MINADVENT_SHARED_THROTTLER_GUARD_MOCK)
      .compile();

    controller = module.get<MinAdventSharedController>(MinAdventSharedController);
  });

  describe('get()', () => {
    it('should return the shared calendar', async () => {
      const response = { title: 'December' };
      MINADVENT_SHARED_CALENDAR_SERVICE_MOCK.getSharedCalendar.mockResolvedValue(response);

      await expect(controller.get('a'.repeat(64))).resolves.toBe(response);
      expect(MINADVENT_SHARED_CALENDAR_SERVICE_MOCK.getSharedCalendar).toHaveBeenCalled();
    });
  });

  describe('getDoor()', () => {
    it('should return the shared door content', async () => {
      const response = { day: 1 };
      MINADVENT_SHARED_CALENDAR_SERVICE_MOCK.getSharedDoor.mockResolvedValue(response);

      await expect(controller.getDoor('a'.repeat(64), 1)).resolves.toBe(response);
      expect(MINADVENT_SHARED_CALENDAR_SERVICE_MOCK.getSharedDoor).toHaveBeenCalled();
    });
  });

  describe('openDoor()', () => {
    it('should return the opened shared door', async () => {
      const input = { expectedVersion: 1 };
      const response = { version: 2 };
      MINADVENT_SHARED_CALENDAR_SERVICE_MOCK.openSharedDoor.mockResolvedValue(response);

      await expect(controller.openDoor('a'.repeat(64), 1, input)).resolves.toBe(response);
      expect(MINADVENT_SHARED_CALENDAR_SERVICE_MOCK.openSharedDoor).toHaveBeenCalled();
    });
  });
});
