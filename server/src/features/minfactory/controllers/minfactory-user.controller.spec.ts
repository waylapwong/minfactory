import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MinFactoryUserDto } from '../models/dtos/minfactory-user.dto';
import { MinFactoryUserService } from '../services/minfactory-user.service';
import { MINFACTORY_USER_SERVICE_MOCK } from '../mocks/minfactory-user.service.mock';
import { MinFactoryUserController } from './minfactory-user.controller';
import { AuthenticationGuard } from 'src/core/authentication/guards/authentication.guard';
import { AUTHENTICATION_GUARD_MOCK } from 'src/core/mocks/authentication.guard.mock';
import { FirebaseUserDto } from 'src/core/authentication/models/firebase-user.dto';
import { AuthenticationService } from 'src/core/authentication/services/authentication.service';
import { AUTHENTICATION_SERVICE_MOCK } from 'src/core/mocks/authentication.service.mock';

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

  describe('create', () => {
    const user: FirebaseUserDto = {
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
    };

    it('should return user dto on success', async () => {
      const dto: MinFactoryUserDto = new MinFactoryUserDto();
      dto.email = 'user@example.com';
      dto.createdAt = new Date();

      MINFACTORY_USER_SERVICE_MOCK.createUser.mockResolvedValue(dto);

      const result = await userController.create(user);

      expect(result).toBe(dto);
      expect(MINFACTORY_USER_SERVICE_MOCK.createUser).toHaveBeenCalledWith(user);
    });

    it('should propagate ConflictException from service', async () => {
      MINFACTORY_USER_SERVICE_MOCK.createUser.mockRejectedValue(new ConflictException());

      await expect(userController.create(user)).rejects.toThrow(ConflictException);
    });
  });

  describe('getMe', () => {
    const user: FirebaseUserDto = {
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
    };

    it('should return user dto on success', async () => {
      const dto: MinFactoryUserDto = new MinFactoryUserDto();
      dto.email = 'user@example.com';
      dto.createdAt = new Date();

      MINFACTORY_USER_SERVICE_MOCK.getMe.mockResolvedValue(dto);

      const result = await userController.getMe(user);

      expect(result).toBe(dto);
      expect(MINFACTORY_USER_SERVICE_MOCK.getMe).toHaveBeenCalledWith(user);
    });

    it('should propagate NotFoundException from service', async () => {
      MINFACTORY_USER_SERVICE_MOCK.getMe.mockRejectedValue(new NotFoundException());

      await expect(userController.getMe(user)).rejects.toThrow(NotFoundException);
    });
  });
});
