import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '../models/entities/user.entity';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let userRepository: UserRepository;

  const mockTypeOrmRepository = {
    count: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRepository, { provide: getRepositoryToken(UserEntity), useValue: mockTypeOrmRepository }],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      const entity: UserEntity = new UserEntity();
      entity.firebaseUid = 'firebase-uid-123';
      entity.email = 'user@example.com';

      const savedEntity: UserEntity = { ...entity, id: '550e8400-e29b-41d4-a716-446655440000', createdAt: new Date() };
      mockTypeOrmRepository.save.mockResolvedValue(savedEntity);

      const result = await userRepository.save(entity);

      expect(result).toBe(savedEntity);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(entity);
    });
  });
});
