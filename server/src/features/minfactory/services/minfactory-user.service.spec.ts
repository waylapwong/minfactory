import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AUTHENTICATION_SERVICE_MOCK } from '../../../core/authentication/mocks/authentication.service.mock';
import { FirebaseUserDto } from '../../../core/authentication/models/firebase-user.dto';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { MinFactoryRole } from '../../../shared/enums/minfactory-role.enum';
import { MINFACTORY_USER_REPOSITORY_MOCK } from '../mocks/minfactory-user.repository.mock';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { MinFactoryUserService } from './minfactory-user.service';

describe('MinFactoryUserService', () => {
  let userService: MinFactoryUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinFactoryUserService,
        { provide: MinFactoryUserRepository, useValue: MINFACTORY_USER_REPOSITORY_MOCK },
        { provide: AuthenticationService, useValue: AUTHENTICATION_SERVICE_MOCK },
      ],
    }).compile();

    userService = module.get<MinFactoryUserService>(MinFactoryUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const user: FirebaseUserDto = {
      uid: 'firebase-uid-123',
      email: 'user@example.com',
    };

    const savedEntity: MinFactoryUserEntity = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
      role: MinFactoryRole.User,
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
    };

    it('should create and return user dto on happy path', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockRejectedValue(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.findByEmail.mockRejectedValue(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.save.mockResolvedValue(savedEntity);

      const result = await userService.createUser(user, 'test-request-id');

      expect(result.email).toBe(savedEntity.email);
      expect(result.createdAt).toBe(savedEntity.createdAt);
    });

    it('should return existing user when firebase uid already exists', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue(savedEntity);

      const result = await userService.createUser(user, 'test-request-id');

      expect(result.email).toBe(savedEntity.email);
      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByEmail).not.toHaveBeenCalled();
      expect(MINFACTORY_USER_REPOSITORY_MOCK.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists for another user', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockRejectedValue(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.findByEmail.mockResolvedValue(savedEntity);

      await expect(userService.createUser(user, 'test-request-id')).rejects.toThrow(ConflictException);
    });

    it('should look up existing users with firebase uid and email before saving', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockRejectedValue(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.findByEmail.mockRejectedValue(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.save.mockResolvedValue(savedEntity);

      await userService.createUser(user, 'test-request-id');

      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid).toHaveBeenCalledWith(user.uid, 'test-request-id');
      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByEmail).toHaveBeenCalledWith(user.email, 'test-request-id');
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

      const result = await userService.createUser(user, 'test-request-id');

      expect(result.email).toBe(savedEntity.email);
      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid).toHaveBeenCalledTimes(2);
    });

    it('should throw original error when save fails with a non-duplicate error', async () => {
      const originalError = new Error('Unexpected database error');
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockRejectedValue(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.findByEmail.mockRejectedValue(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.save.mockRejectedValue(originalError);

      await expect(userService.createUser(user, 'test-request-id')).rejects.toThrow('Unexpected database error');
    });

    it('should rethrow original duplicate error when neither uid nor email found after race condition', async () => {
      const duplicateError = { driverError: { code: 'ER_DUP_ENTRY' } };
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockRejectedValue(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.findByEmail
        .mockRejectedValueOnce(new NotFoundException('User not found'))
        .mockRejectedValueOnce(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.save.mockRejectedValue(duplicateError);

      await expect(userService.createUser(user, 'test-request-id')).rejects.toEqual(duplicateError);
    });

    it('should throw ConflictException when email found in catch block after race condition', async () => {
      const duplicateError = { driverError: { code: 'ER_DUP_ENTRY' } };
      const duplicatedEntity: MinFactoryUserEntity = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        firebaseUid: 'other-uid',
        email: 'user@example.com',
        role: MinFactoryRole.User,
        createdAt: new Date(),
      };
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockRejectedValue(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.findByEmail
        .mockRejectedValueOnce(new NotFoundException('User not found'))
        .mockResolvedValueOnce(duplicatedEntity);
      MINFACTORY_USER_REPOSITORY_MOCK.save.mockRejectedValue(duplicateError);

      await expect(userService.createUser(user, 'test-request-id')).rejects.toThrow(ConflictException);
    });

    it('should propagate non-NotFoundException from findByEmail lookup', async () => {
      const unexpectedError = new Error('DB connection lost');
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockRejectedValue(new NotFoundException('User not found'));
      MINFACTORY_USER_REPOSITORY_MOCK.findByEmail.mockRejectedValue(unexpectedError);

      await expect(userService.createUser(user, 'test-request-id')).rejects.toThrow('DB connection lost');
    });

    it('should propagate non-NotFoundException from findByFirebaseUid lookup', async () => {
      const unexpectedError = new Error('DB connection lost');
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockRejectedValue(unexpectedError);

      await expect(userService.createUser(user, 'test-request-id')).rejects.toThrow('DB connection lost');
    });
  });

  describe('getMe()', () => {
    const user: FirebaseUserDto = {
      uid: 'firebase-uid-123',
      email: 'user@example.com',
    };

    const existingEntity: MinFactoryUserEntity = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
      role: MinFactoryRole.User,
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
    };

    it('should return user dto when user is found', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue(existingEntity);

      const result = await userService.getMe(user, 'test-request-id');

      expect(result.email).toBe(existingEntity.email);
      expect(result.createdAt).toBe(existingEntity.createdAt);
    });

    it('should call repository with the given firebaseUid', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue(existingEntity);

      await userService.getMe(user, 'test-request-id');

      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid).toHaveBeenCalledWith(user.uid, 'test-request-id');
    });

    it('should throw NotFoundException when user is not found', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockRejectedValue(new NotFoundException('User not found'));

      await expect(userService.getMe(user, 'test-request-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteMe()', () => {
    const user: FirebaseUserDto = {
      uid: 'firebase-uid-123',
      email: 'user@example.com',
    };

    const existingEntity: MinFactoryUserEntity = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
      role: MinFactoryRole.User,
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
    };

    it('should check DB, delete Firebase user, then delete DB user', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue(existingEntity);
      AUTHENTICATION_SERVICE_MOCK.deleteUser.mockResolvedValue(undefined);
      MINFACTORY_USER_REPOSITORY_MOCK.deleteByFirebaseUid.mockResolvedValue(undefined);

      await userService.deleteMe(user, 'test-request-id');

      expect(MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid).toHaveBeenCalledWith(user.uid, 'test-request-id');
      expect(AUTHENTICATION_SERVICE_MOCK.deleteUser).toHaveBeenCalledWith(user.uid);
      expect(MINFACTORY_USER_REPOSITORY_MOCK.deleteByFirebaseUid).toHaveBeenCalledWith(user.uid, 'test-request-id');
    });

    it('should throw NotFoundException without touching Firebase when user is not found in DB', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockRejectedValue(new NotFoundException('User not found'));

      await expect(userService.deleteMe(user, 'test-request-id')).rejects.toThrow(NotFoundException);
      expect(AUTHENTICATION_SERVICE_MOCK.deleteUser).not.toHaveBeenCalled();
    });

    it('should delete Firebase user before DB user', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue(existingEntity);
      const callOrder: string[] = [];
      AUTHENTICATION_SERVICE_MOCK.deleteUser.mockImplementation(() => {
        callOrder.push('firebase');
      });
      MINFACTORY_USER_REPOSITORY_MOCK.deleteByFirebaseUid.mockImplementation(() => {
        callOrder.push('db');
      });

      await userService.deleteMe(user, 'test-request-id');

      expect(callOrder).toEqual(['firebase', 'db']);
    });

    it('should propagate error when Firebase deletion fails with unexpected error', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue(existingEntity);
      AUTHENTICATION_SERVICE_MOCK.deleteUser.mockRejectedValue(new Error('Firebase error'));

      await expect(userService.deleteMe(user, 'test-request-id')).rejects.toThrow('Firebase error');
      expect(MINFACTORY_USER_REPOSITORY_MOCK.deleteByFirebaseUid).not.toHaveBeenCalled();
    });

    it('should still delete DB user when Firebase user is already deleted (auth/user-not-found)', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue(existingEntity);
      AUTHENTICATION_SERVICE_MOCK.deleteUser.mockRejectedValue({ code: 'auth/user-not-found' });
      MINFACTORY_USER_REPOSITORY_MOCK.deleteByFirebaseUid.mockResolvedValue(undefined);

      await userService.deleteMe(user, 'test-request-id');

      expect(MINFACTORY_USER_REPOSITORY_MOCK.deleteByFirebaseUid).toHaveBeenCalledWith(user.uid, 'test-request-id');
    });

    it('should propagate Firebase error when it is not an object', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockResolvedValue(existingEntity);
      AUTHENTICATION_SERVICE_MOCK.deleteUser.mockRejectedValue('string-error');

      await expect(userService.deleteMe(user, 'test-request-id')).rejects.toBe('string-error');
    });
  });

  describe('createUser() - isDuplicateUserError with non-object error', () => {
    it('should rethrow when save fails with a null error', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.findByFirebaseUid.mockRejectedValue(new NotFoundException());
      MINFACTORY_USER_REPOSITORY_MOCK.findByEmail.mockRejectedValue(new NotFoundException());
      MINFACTORY_USER_REPOSITORY_MOCK.save.mockRejectedValue(null);

      await expect(userService.createUser({ uid: 'firebase-uid-123', email: 'user@example.com' }, 'test-request-id')).rejects.toBeNull();
    });
  });
});
