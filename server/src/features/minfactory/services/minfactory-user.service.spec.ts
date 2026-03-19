import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { MinFactoryUserService } from './minfactory-user.service';

describe('MinFactoryUserService', () => {
  let userService: MinFactoryUserService;

  const mockMinFactoryUserRepository = {
    findByEmail: jest.fn(),
    findByFirebaseUid: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinFactoryUserService, { provide: MinFactoryUserRepository, useValue: mockMinFactoryUserRepository }],
    }).compile();

    userService = module.get<MinFactoryUserService>(MinFactoryUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const firebaseUid = 'firebase-uid-123';
    const email = 'user@example.com';

    const savedEntity: MinFactoryUserEntity = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
    };

    it('should create and return user dto on happy path', async () => {
      mockMinFactoryUserRepository.findByFirebaseUid.mockResolvedValue(null);
      mockMinFactoryUserRepository.findByEmail.mockResolvedValue(null);
      mockMinFactoryUserRepository.save.mockResolvedValue(savedEntity);

      const result = await userService.createUser(firebaseUid, email);

      expect(result.id).toBe(savedEntity.id);
      expect(result.email).toBe(savedEntity.email);
      expect(result.createdAt).toBe(savedEntity.createdAt);
    });

    it('should return existing user when firebase uid already exists', async () => {
      mockMinFactoryUserRepository.findByFirebaseUid.mockResolvedValue(savedEntity);

      const result = await userService.createUser(firebaseUid, email);

      expect(result.id).toBe(savedEntity.id);
      expect(mockMinFactoryUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockMinFactoryUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists for another user', async () => {
      mockMinFactoryUserRepository.findByFirebaseUid.mockResolvedValue(null);
      mockMinFactoryUserRepository.findByEmail.mockResolvedValue(savedEntity);

      await expect(userService.createUser(firebaseUid, email)).rejects.toThrow(ConflictException);
    });

    it('should look up existing users with firebase uid and email before saving', async () => {
      mockMinFactoryUserRepository.findByFirebaseUid.mockResolvedValue(null);
      mockMinFactoryUserRepository.findByEmail.mockResolvedValue(null);
      mockMinFactoryUserRepository.save.mockResolvedValue(savedEntity);

      await userService.createUser(firebaseUid, email);

      expect(mockMinFactoryUserRepository.findByFirebaseUid).toHaveBeenCalledWith(firebaseUid);
      expect(mockMinFactoryUserRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should return existing user when save hits duplicate firebase uid race', async () => {
      mockMinFactoryUserRepository.findByFirebaseUid.mockResolvedValueOnce(null).mockResolvedValueOnce(savedEntity);
      mockMinFactoryUserRepository.findByEmail.mockResolvedValue(null);
      mockMinFactoryUserRepository.save.mockRejectedValue({
        driverError: {
          code: 'ER_DUP_ENTRY',
        },
      });

      const result = await userService.createUser(firebaseUid, email);

      expect(result.id).toBe(savedEntity.id);
      expect(mockMinFactoryUserRepository.findByFirebaseUid).toHaveBeenCalledTimes(2);
    });

    it('should throw ConflictException when save hits duplicate email race', async () => {
      const conflictingEntity: MinFactoryUserEntity = {
        ...savedEntity,
        firebaseUid: 'other-firebase-uid',
      };
      mockMinFactoryUserRepository.findByFirebaseUid.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      mockMinFactoryUserRepository.findByEmail.mockResolvedValueOnce(null).mockResolvedValueOnce(conflictingEntity);
      mockMinFactoryUserRepository.save.mockRejectedValue({
        driverError: {
          errno: 1062,
        },
      });

      await expect(userService.createUser(firebaseUid, email)).rejects.toThrow(ConflictException);
    });
  });

  describe('getMe', () => {
    const firebaseUid = 'firebase-uid-123';

    const existingEntity: MinFactoryUserEntity = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
    };

    it('should return user dto when user is found', async () => {
      mockMinFactoryUserRepository.findByFirebaseUid.mockResolvedValue(existingEntity);

      const result = await userService.getMe(firebaseUid);

      expect(result.id).toBe(existingEntity.id);
      expect(result.email).toBe(existingEntity.email);
      expect(result.createdAt).toBe(existingEntity.createdAt);
    });

    it('should call repository with the given firebaseUid', async () => {
      mockMinFactoryUserRepository.findByFirebaseUid.mockResolvedValue(existingEntity);

      await userService.getMe(firebaseUid);

      expect(mockMinFactoryUserRepository.findByFirebaseUid).toHaveBeenCalledWith(firebaseUid);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockMinFactoryUserRepository.findByFirebaseUid.mockResolvedValue(null);

      await expect(userService.getMe(firebaseUid)).rejects.toThrow(NotFoundException);
    });
  });
});
