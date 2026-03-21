import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';
import { MINFACTORY_USER_TYPEORM_REPOSITORY_MOCK } from './minfactory-user.typeorm-repository.mock';
import { MinFactoryUserRepository } from './minfactory-user.repository';

describe('MinFactoryUserRepository', () => {
  let userRepository: MinFactoryUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinFactoryUserRepository,
        { provide: getRepositoryToken(MinFactoryUserEntity), useValue: MINFACTORY_USER_TYPEORM_REPOSITORY_MOCK },
      ],
    }).compile();

    userRepository = module.get<MinFactoryUserRepository>(MinFactoryUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const entity: MinFactoryUserEntity = {
        id: 'user-id',
        firebaseUid: 'firebase-uid-123',
        email: 'user@example.com',
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      };
      MINFACTORY_USER_TYPEORM_REPOSITORY_MOCK.findOne.mockResolvedValue(entity);

      const result = await userRepository.findByEmail('user@example.com');

      expect(result).toBe(entity);
      expect(MINFACTORY_USER_TYPEORM_REPOSITORY_MOCK.findOne).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      MINFACTORY_USER_TYPEORM_REPOSITORY_MOCK.findOne.mockResolvedValue(null);

      await expect(userRepository.findByEmail('missing@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByFirebaseUid', () => {
    it('should return a user by firebase uid', async () => {
      const entity: MinFactoryUserEntity = {
        id: 'user-id',
        firebaseUid: 'firebase-uid-123',
        email: 'user@example.com',
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      };
      MINFACTORY_USER_TYPEORM_REPOSITORY_MOCK.findOne.mockResolvedValue(entity);

      const result = await userRepository.findByFirebaseUid('firebase-uid-123');

      expect(result).toBe(entity);
      expect(MINFACTORY_USER_TYPEORM_REPOSITORY_MOCK.findOne).toHaveBeenCalledWith({
        where: { firebaseUid: 'firebase-uid-123' },
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      MINFACTORY_USER_TYPEORM_REPOSITORY_MOCK.findOne.mockResolvedValue(null);

      await expect(userRepository.findByFirebaseUid('firebase-uid-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('save', () => {
    it('should save and return the entity', async () => {
      const entity: MinFactoryUserEntity = new MinFactoryUserEntity();
      entity.firebaseUid = 'firebase-uid-123';
      entity.email = 'user@example.com';

      const savedEntity: MinFactoryUserEntity = {
        ...entity,
        id: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date(),
      };
      MINFACTORY_USER_TYPEORM_REPOSITORY_MOCK.save.mockResolvedValue(savedEntity);

      const result = await userRepository.save(entity);

      expect(result).toBe(savedEntity);
      expect(MINFACTORY_USER_TYPEORM_REPOSITORY_MOCK.save).toHaveBeenCalledWith(entity);
    });
  });
});
