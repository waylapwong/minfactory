import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { MinFactoryUserService } from './minfactory-user.service';
import { AuthenticationService } from 'src/core/authentication/authentication.service';

describe('MinFactoryUserService', () => {
  let userService: MinFactoryUserService;

  const mockAuthenticationService = {
    verifyIdToken: jest.fn(),
  };

  const mockMinFactoryUserRepository = {
    existsByFirebaseUidOrEmail: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinFactoryUserService,
        { provide: AuthenticationService, useValue: mockAuthenticationService },
        { provide: MinFactoryUserRepository, useValue: mockMinFactoryUserRepository },
      ],
    }).compile();

    userService = module.get<MinFactoryUserService>(MinFactoryUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const validToken = 'valid-firebase-token';
    const validAuthHeader = `Bearer ${validToken}`;

    const decodedToken = {
      uid: 'firebase-uid-123',
      email: 'user@example.com',
    };

    const savedEntity: MinFactoryUserEntity = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      firebaseUid: 'firebase-uid-123',
      email: 'user@example.com',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
    };

    it('should create and return user dto on happy path', async () => {
      mockAuthenticationService.verifyIdToken.mockResolvedValue(decodedToken);
      mockMinFactoryUserRepository.existsByFirebaseUidOrEmail.mockResolvedValue(false);
      mockMinFactoryUserRepository.save.mockResolvedValue(savedEntity);

      const result = await userService.createUser(validAuthHeader);

      expect(result.id).toBe(savedEntity.id);
      expect(result.email).toBe(savedEntity.email);
      expect(result.createdAt).toBe(savedEntity.createdAt);
      expect(mockAuthenticationService.verifyIdToken).toHaveBeenCalledWith(validToken);
    });

    it('should throw UnauthorizedException when authorization header is missing', async () => {
      await expect(userService.createUser('')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when authorization header has no Bearer prefix', async () => {
      await expect(userService.createUser('InvalidHeader token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when firebase token is invalid', async () => {
      mockAuthenticationService.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await expect(userService.createUser(validAuthHeader)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when firebase token has no email claim', async () => {
      mockAuthenticationService.verifyIdToken.mockResolvedValue({ uid: 'firebase-uid-123', email: null });

      await expect(userService.createUser(validAuthHeader)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ConflictException when user already exists', async () => {
      mockAuthenticationService.verifyIdToken.mockResolvedValue(decodedToken);
      mockMinFactoryUserRepository.existsByFirebaseUidOrEmail.mockResolvedValue(true);

      await expect(userService.createUser(validAuthHeader)).rejects.toThrow(ConflictException);
    });

    it('should check for existing user with uid and email from token', async () => {
      mockAuthenticationService.verifyIdToken.mockResolvedValue(decodedToken);
      mockMinFactoryUserRepository.existsByFirebaseUidOrEmail.mockResolvedValue(false);
      mockMinFactoryUserRepository.save.mockResolvedValue(savedEntity);

      await userService.createUser(validAuthHeader);

      expect(mockMinFactoryUserRepository.existsByFirebaseUidOrEmail).toHaveBeenCalledWith(
        decodedToken.uid,
        decodedToken.email,
      );
    });
  });
});
