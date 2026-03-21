import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { MINFACTORY_USER_REPOSITORY_MOCK } from '../repositories/minfactory-user.repository.mock';
import { MinFactoryUserService } from './minfactory-user.service';
import { FirebaseUserDto } from 'src/core/authentication/models/firebase-user.dto';

describe('MinFactoryUserService', () => {
  let userService: MinFactoryUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinFactoryUserService,
        { provide: MinFactoryUserRepository, useValue: MINFACTORY_USER_REPOSITORY_MOCK },
      ],
    }).compile();

    userService = module.get<MinFactoryUserService>(MinFactoryUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const user: FirebaseUserDto = {
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
    };

    const savedEntity: MinFactoryUserEntity = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
    };

    it('should create and return user dto on happy path', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockRejectedValue(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.findByEmail.mockRejectedValue(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.save.mockResolvedValue(savedEntity);

      const result = await userService.createUser(user);

      expect(result.email).toBe(savedEntity.email);
      expect(result.createdAt).toBe(savedEntity.createdAt);
    });

    it('should return existing user when firebase uid already exists', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue(savedEntity);

      const result = await userService.createUser(user);

      expect(result.email).toBe(savedEntity.email);
      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByEmail).not.toHaveBeenCalled();
      expect(MINFACTORY_USER_REPOSITORY_MOCK.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists for another user', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockRejectedValue(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.findByEmail.mockResolvedValue(savedEntity);

      await expect(userService.createUser(user)).rejects.toThrow(ConflictException);
    });

    it('should look up existing users with firebase uid and email before saving', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockRejectedValue(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.findByEmail.mockRejectedValue(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.save.mockResolvedValue(savedEntity);

      await userService.createUser(user);

      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid).toHaveBeenCalledWith(user.firebaseUid);
      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByEmail).toHaveBeenCalledWith(user.email);
    });

    it('should return existing user when save hits duplicate firebase uid race', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid
        .mockRejectedValueOnce(new NotFoundException('User not found'))
        .mockResolvedValueOnce(savedEntity);
      MINFACTORY_USER_REPOSITORY_MOCK.findByEmail.mockRejectedValue(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.save.mockRejectedValue({
        driverError: {
          code: 'ER_DUP_ENTRY',
        },
      });

      const result = await userService.createUser(user);

      expect(result.email).toBe(savedEntity.email);
      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid).toHaveBeenCalledTimes(2);
    });

    it('should throw ConflictException when save hits duplicate email race', async () => {
      const conflictingEntity: MinFactoryUserEntity = {
        ...savedEntity,
        firebaseUid: 'other-firebase-uid',
      };
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid
        .mockRejectedValueOnce(new NotFoundException('User not found'))
        .mockRejectedValueOnce(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.findByEmail
        .mockRejectedValueOnce(new NotFoundException('User not found'))
        .mockResolvedValueOnce(conflictingEntity);
      MINFACTORY_USER_REPOSITORY_MOCK.save.mockRejectedValue({
        driverError: {
          errno: 1062,
        },
      });

      await expect(userService.createUser(user)).rejects.toThrow(ConflictException);
    });
  });

  describe('getMe', () => {
    const user: FirebaseUserDto = {
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
    };

    const existingEntity: MinFactoryUserEntity = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
    };

    it('should return user dto when user is found', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue(existingEntity);

      const result = await userService.getMe(user);

      expect(result.email).toBe(existingEntity.email);
      expect(result.createdAt).toBe(existingEntity.createdAt);
    });

    it('should call repository with the given firebaseUid', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue(existingEntity);

      await userService.getMe(user);

      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid).toHaveBeenCalledWith(user.firebaseUid);
    });

    it('should throw NotFoundException when user is not found', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockRejectedValue(new NotFoundException('User not found'));

      await expect(userService.getMe(user)).rejects.toThrow(NotFoundException);
    });
  });
});
