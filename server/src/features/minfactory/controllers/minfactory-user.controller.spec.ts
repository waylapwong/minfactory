import { ConflictException, NotFoundException } from '@nestjs/common';
import { AuthorizationModule } from '@nestjs/authorization';
import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseGuard } from '../../../core/authentication/guards/firebase.guard';
import { AUTHENTICATION_GUARD_MOCK } from '../../../core/authentication/mocks/authentication.guard.mock';
import { AUTHENTICATION_SERVICE_MOCK } from '../../../core/authentication/mocks/authentication.service.mock';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { MINFACTORY_USER_SERVICE_MOCK } from '../mocks/minfactory-user.service.mock';
import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryRole } from '../../../shared/enums/minfactory-role.enum';
import { MinFactoryUserGuard } from '../guards/minfactory-user.guard';
import { MinFactoryRolePolicy } from '../policies/minfactory-role.policy';
import { MinFactoryUserDto } from '../models/dtos/minfactory-user.dto';
import { MinFactoryUserService } from '../services/minfactory-user.service';
import { MinFactoryUserController } from './minfactory-user.controller';

describe('MinFactoryUserController', () => {
  let userController: MinFactoryUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthorizationModule.forRoot({ globalGuard: false })],
      controllers: [MinFactoryUserController],
      providers: [
        { provide: MinFactoryUserService, useValue: MINFACTORY_USER_SERVICE_MOCK },
        { provide: FirebaseGuard, useValue: AUTHENTICATION_GUARD_MOCK },
        { provide: AuthenticationService, useValue: AUTHENTICATION_SERVICE_MOCK },
        MinFactoryUserGuard,
        MinFactoryRolePolicy,
      ],
    }).compile();

    userController = module.get<MinFactoryUserController>(MinFactoryUserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteMe()', () => {
    const user: MinFactoryUser = Object.assign(new MinFactoryUser(), {
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
      id: 'user-id',
      role: MinFactoryRole.User,
    });

    it('should call deleteMe on service with the given user', async () => {
      MINFACTORY_USER_SERVICE_MOCK.deleteMe.mockResolvedValue(undefined);

      await userController.deleteMe(user, 'test-request-id');

      expect(MINFACTORY_USER_SERVICE_MOCK.deleteMe).toHaveBeenCalledWith(user, 'test-request-id');
    });

    it('should propagate NotFoundException from service', async () => {
      MINFACTORY_USER_SERVICE_MOCK.deleteMe.mockRejectedValue(new NotFoundException());

      await expect(userController.deleteMe(user, 'test-request-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create()', () => {
    const user: MinFactoryUser = Object.assign(new MinFactoryUser(), {
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
      id: 'user-id',
      role: MinFactoryRole.User,
    });

    it('should return user dto on success', async () => {
      const dto: MinFactoryUserDto = new MinFactoryUserDto();
      dto.email = 'user@example.com';
      dto.createdAt = new Date();

      MINFACTORY_USER_SERVICE_MOCK.createUser.mockResolvedValue(dto);

      const result = await userController.create(user, 'test-request-id');

      expect(result).toBe(dto);
      expect(MINFACTORY_USER_SERVICE_MOCK.createUser).toHaveBeenCalledWith(user, 'test-request-id');
    });

    it('should propagate ConflictException from service', async () => {
      MINFACTORY_USER_SERVICE_MOCK.createUser.mockRejectedValue(new ConflictException());

      await expect(userController.create(user, 'test-request-id')).rejects.toThrow(ConflictException);
    });
  });

  describe('getMe()', () => {
    const user: MinFactoryUser = Object.assign(new MinFactoryUser(), {
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
      id: 'user-id',
      role: MinFactoryRole.User,
    });

    it('should return user dto on success', () => {
      const dto: MinFactoryUserDto = new MinFactoryUserDto();
      dto.email = 'user@example.com';
      dto.createdAt = new Date();

      MINFACTORY_USER_SERVICE_MOCK.getMe.mockReturnValue(dto);

      const result = userController.getMe(user, 'test-request-id');

      expect(result).toBe(dto);
      expect(MINFACTORY_USER_SERVICE_MOCK.getMe).toHaveBeenCalledWith(user);
    });
  });
});
