import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationGuard } from '../../../core/authentication/guards/authentication.guard';
import { AUTHENTICATION_GUARD_MOCK } from '../../../core/authentication/mocks/authentication.guard.mock';
import { AUTHENTICATION_SERVICE_MOCK } from '../../../core/authentication/mocks/authentication.service.mock';
import { FirebaseUserDto } from '../../../core/authentication/models/firebase-user.dto';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { MINFACTORY_USER_SERVICE_MOCK } from '../mocks/minfactory-user.service.mock';
import { MinFactoryUserDto } from '../models/dtos/minfactory-user.dto';
import { MinFactoryUserService } from '../services/minfactory-user.service';
import { MinFactoryUserController } from './minfactory-user.controller';

describe('MinFactoryUserController', () => {
  let userController: MinFactoryUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinFactoryUserController],
      providers: [
        { provide: MinFactoryUserService, useValue: MINFACTORY_USER_SERVICE_MOCK },
        { provide: AuthenticationGuard, useValue: AUTHENTICATION_GUARD_MOCK },
        { provide: AuthenticationService, useValue: AUTHENTICATION_SERVICE_MOCK },
      ],
    }).compile();

    userController = module.get<MinFactoryUserController>(MinFactoryUserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteMe()', () => {
    const user: FirebaseUserDto = {
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
    };

    it('should call deleteMe on service with the given user', async () => {
      MINFACTORY_USER_SERVICE_MOCK.deleteMe.mockResolvedValue(undefined);

      await userController.deleteMe(user, 'test-request-id');

      expect(MINFACTORY_USER_SERVICE_MOCK.deleteMe).toHaveBeenCalledWith(user);
    });

    it('should propagate NotFoundException from service', async () => {
      MINFACTORY_USER_SERVICE_MOCK.deleteMe.mockRejectedValue(new NotFoundException());

      await expect(userController.deleteMe(user, 'test-request-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create()', () => {
    const user: FirebaseUserDto = {
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
    };

    it('should return user dto on success', async () => {
      const dto: MinFactoryUserDto = new MinFactoryUserDto();
      dto.email = 'user@example.com';
      dto.createdAt = new Date();

      MINFACTORY_USER_SERVICE_MOCK.createUser.mockResolvedValue(dto);

      const result = await userController.create(user, 'test-request-id');

      expect(result).toBe(dto);
      expect(MINFACTORY_USER_SERVICE_MOCK.createUser).toHaveBeenCalledWith(user);
    });

    it('should propagate ConflictException from service', async () => {
      MINFACTORY_USER_SERVICE_MOCK.createUser.mockRejectedValue(new ConflictException());

      await expect(userController.create(user, 'test-request-id')).rejects.toThrow(ConflictException);
    });
  });

  describe('getMe()', () => {
    const user: FirebaseUserDto = {
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
    };

    it('should return user dto on success', async () => {
      const dto: MinFactoryUserDto = new MinFactoryUserDto();
      dto.email = 'user@example.com';
      dto.createdAt = new Date();

      MINFACTORY_USER_SERVICE_MOCK.getMe.mockResolvedValue(dto);

      const result = await userController.getMe(user, 'test-request-id');

      expect(result).toBe(dto);
      expect(MINFACTORY_USER_SERVICE_MOCK.getMe).toHaveBeenCalledWith(user);
    });

    it('should propagate NotFoundException from service', async () => {
      MINFACTORY_USER_SERVICE_MOCK.getMe.mockRejectedValue(new NotFoundException());

      await expect(userController.getMe(user, 'test-request-id')).rejects.toThrow(NotFoundException);
    });
  });
});
