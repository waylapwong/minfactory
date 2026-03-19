import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';
import { MinFactoryUserRepository } from './minfactory-user.repository';

describe('MinFactoryUserRepository', () => {
  let userRepository: MinFactoryUserRepository;

  const mockTypeOrmRepository = {
    findOne: jest.fn(),
    count: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinFactoryUserRepository,
        { provide: getRepositoryToken(MinFactoryUserEntity), useValue: mockTypeOrmRepository },
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
      mockTypeOrmRepository.findOne.mockResolvedValue(entity);

      const result = await userRepository.findByEmail('user@example.com');

      expect(result).toBe(entity);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
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
      mockTypeOrmRepository.findOne.mockResolvedValue(entity);

      const result = await userRepository.findByFirebaseUid('firebase-uid-123');

      expect(result).toBe(entity);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { firebaseUid: 'firebase-uid-123' },
      });
    });
  });

  describe('existsByFirebaseUidOrEmail', () => {
    it('should return true when user with firebaseUid exists', async () => {
      mockTypeOrmRepository.count.mockResolvedValue(1);

      const result = await userRepository.existsByFirebaseUidOrEmail('firebase-uid-123', 'user@example.com');

      expect(result).toBe(true);
      expect(mockTypeOrmRepository.count).toHaveBeenCalledWith({
        where: [{ firebaseUid: 'firebase-uid-123' }, { email: 'user@example.com' }],
      });
    });

    it('should return false when no user exists', async () => {
      mockTypeOrmRepository.count.mockResolvedValue(0);

      const result = await userRepository.existsByFirebaseUidOrEmail('firebase-uid-123', 'user@example.com');

      expect(result).toBe(false);
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
      mockTypeOrmRepository.save.mockResolvedValue(savedEntity);

      const result = await userRepository.save(entity);

      expect(result).toBe(savedEntity);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(entity);
    });
  });
});
