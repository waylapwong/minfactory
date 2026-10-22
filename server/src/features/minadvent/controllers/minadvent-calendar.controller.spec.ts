import { AuthorizationGuard, AuthorizationModule } from '@nestjs/authorization';
import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseGuard } from '../../../core/authentication/guards/firebase.guard';
import { AUTHENTICATION_GUARD_MOCK } from '../../../core/authentication/mocks/authentication.guard.mock';
import { AUTHORIZATION_GUARD_MOCK } from '../../../core/authorization/mocks/authorization.guard.mock';
import { USER_ROLE_POLICY_MOCK } from '../../../core/authorization/mocks/user-role.policy.mock';
import { UserRolePolicy } from '../../../core/authorization/policies/user-role.policy';
import { MinFactoryUserGuard } from '../../minfactory/guards/minfactory-user.guard';
import { MINFACTORY_USER_GUARD_MOCK } from '../../minfactory/mocks/minfactory-user.guard.mock';
import { MinFactoryUser } from '../../minfactory/models/domains/minfactory-user';
import { MINADVENT_CALENDAR_SERVICE_MOCK } from '../mocks/minadvent-calendar.service.mock';
import { MinAdventCalendarService } from '../services/minadvent-calendar.service';
import { MinAdventCalendarController } from './minadvent-calendar.controller';

describe('MinAdventCalendarController', () => {
  let controller: MinAdventCalendarController;
  const calendarService = MINADVENT_CALENDAR_SERVICE_MOCK;
  let user: MinFactoryUser;
  const calendarId = 'calendar-id';

  beforeEach(async () => {
    jest.clearAllMocks();
    user = Object.assign(new MinFactoryUser(), {
      firebaseUid: 'firebase-uid',
      email: 'user@example.com',
      id: 'user-id',
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthorizationModule.forRoot({ globalGuard: false })],
      controllers: [MinAdventCalendarController],
      providers: [
        { provide: UserRolePolicy, useValue: USER_ROLE_POLICY_MOCK },
        { provide: MinAdventCalendarService, useValue: MINADVENT_CALENDAR_SERVICE_MOCK },
      ],
    })
      .overrideGuard(FirebaseGuard)
      .useValue(AUTHENTICATION_GUARD_MOCK)
      .overrideGuard(MinFactoryUserGuard)
      .useValue(MINFACTORY_USER_GUARD_MOCK)
      .overrideGuard(AuthorizationGuard)
      .useValue(AUTHORIZATION_GUARD_MOCK)
      .compile();

    controller = module.get<MinAdventCalendarController>(MinAdventCalendarController);
  });

  describe('deleteMinAdventCalendar()', () => {
    it('should delete the calendar for the user', async () => {
      const input = { expectedVersion: 2 } as never;

      await expect(controller.deleteMinAdventCalendar(input, calendarId, user)).resolves.toBeUndefined();
      expect(calendarService.delete).toHaveBeenCalled();
    });
  });

  describe('getAllMinAdventCalendars()', () => {
    it('should return the user calendars', async () => {
      const calendars = [{ title: 'December' }] as never[];
      calendarService.list.mockResolvedValue(calendars);

      await expect(controller.getAllMinAdventCalendars(user)).resolves.toBe(calendars);
      expect(calendarService.list).toHaveBeenCalled();
    });
  });

  describe('getMinAdventCalendar()', () => {
    it('should return the requested calendar', async () => {
      const calendar = { title: 'December' } as never;
      calendarService.get.mockResolvedValue(calendar);

      await expect(controller.getMinAdventCalendar(calendarId, user)).resolves.toBe(calendar);
      expect(calendarService.get).toHaveBeenCalled();
    });
  });

  describe('getShare()', () => {
    it('should return the calendar sharing details', async () => {
      const sharing = { published: true } as never;
      calendarService.getSharing.mockResolvedValue(sharing);

      await expect(controller.getShare(user, calendarId)).resolves.toBe(sharing);
      expect(calendarService.getSharing).toHaveBeenCalled();
    });
  });

  describe('createMinAdventCalendar()', () => {
    it('should create a calendar for the user', async () => {
      const input = { title: 'December' } as never;
      const calendar = { title: 'December' } as never;
      calendarService.create.mockResolvedValue(calendar);

      await expect(controller.createMinAdventCalendar(input, user)).resolves.toBe(calendar);
      expect(calendarService.create).toHaveBeenCalled();
    });
  });

  describe('updateMinAdventCalendar()', () => {
    it('should update the requested calendar', async () => {
      const input = { title: 'Updated' } as never;
      const calendar = { title: 'Updated' } as never;
      calendarService.update.mockResolvedValue(calendar);

      await expect(controller.updateMinAdventCalendar(input, calendarId, user)).resolves.toBe(calendar);
      expect(calendarService.update).toHaveBeenCalled();
    });
  });

  describe('updateMinAdventDoor()', () => {
    it('should update the requested door', async () => {
      const input = { blocks: [] } as never;
      const response = { version: 3 } as never;
      calendarService.updateDoor.mockResolvedValue(response);

      await expect(controller.updateMinAdventDoor(input, 4, calendarId, user)).resolves.toBe(response);
      expect(calendarService.updateDoor).toHaveBeenCalled();
    });
  });

  describe('updateMinAdventDoorStatus()', () => {
    it('should update the requested door status', async () => {
      const input = { expectedVersion: 2 } as never;
      const response = { version: 3 } as never;
      calendarService.updateDoorStatus.mockResolvedValue(response);

      await expect(controller.updateMinAdventDoorStatus(input, 4, calendarId, user)).resolves.toBe(response);
      expect(calendarService.updateDoorStatus).toHaveBeenCalled();
    });
  });

  describe('updateShare()', () => {
    it('should update the calendar sharing settings', async () => {
      const input = { published: true } as never;
      const sharing = { published: true } as never;
      calendarService.updateSharing.mockResolvedValue(sharing);

      await expect(controller.updateShare(user, calendarId, input)).resolves.toBe(sharing);
      expect(calendarService.updateSharing).toHaveBeenCalled();
    });
  });

  describe('updateSharingToken()', () => {
    it('should rotate the calendar sharing token', async () => {
      const input = { expectedVersion: 2 } as never;
      const sharing = { published: true } as never;
      calendarService.rotateSharingToken.mockResolvedValue(sharing);

      await expect(controller.updateSharingToken(user, calendarId, input)).resolves.toBe(sharing);
      expect(calendarService.rotateSharingToken).toHaveBeenCalled();
    });
  });
});
