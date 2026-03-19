import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { MinFactoryUserService } from './minfactory-user.service';

describe('MinFactoryUserService', () => {
  let userService: MinFactoryUserService;

  const mockMinFactoryUserRepository = {
    existsByFirebaseUidOrEmail: jest.fn(),
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
      mockMinFactoryUserRepository.existsByFirebaseUidOrEmail.mockResolvedValue(false);
      mockMinFactoryUserRepository.save.mockResolvedValue(savedEntity);

      const result = await userService.createUser(firebaseUid, email);

      expect(result.id).toBe(savedEntity.id);
      expect(result.email).toBe(savedEntity.email);
      expect(result.createdAt).toBe(savedEntity.createdAt);
    });

    it('should throw ConflictException when user already exists', async () => {
      mockMinFactoryUserRepository.existsByFirebaseUidOrEmail.mockResolvedValue(true);

      await expect(userService.createUser(firebaseUid, email)).rejects.toThrow(ConflictException);
    });

    it('should check for existing user with uid and email from token', async () => {
      mockMinFactoryUserRepository.existsByFirebaseUidOrEmail.mockResolvedValue(false);
      mockMinFactoryUserRepository.save.mockResolvedValue(savedEntity);

      await userService.createUser(firebaseUid, email);

      expect(mockMinFactoryUserRepository.existsByFirebaseUidOrEmail).toHaveBeenCalledWith(firebaseUid, email);
    });
  });
});
