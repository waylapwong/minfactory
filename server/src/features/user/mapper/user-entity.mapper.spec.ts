import { User } from '../models/domains/user';
import { UserEntity } from '../models/entities/user.entity';
import { UserEntityMapper } from './user-entity.mapper';

describe('UserEntityMapper', () => {
  describe('entityToDomain', () => {
    it('should map entity to domain correctly', () => {
      const entity: UserEntity = new UserEntity();
      entity.id = '550e8400-e29b-41d4-a716-446655440000';
      entity.firebaseUid = 'firebase-uid-123';
      entity.email = 'user@example.com';
      entity.createdAt = new Date('2025-01-01T00:00:00.000Z');

      const domain: User = UserEntityMapper.entityToDomain(entity);

      expect(domain.id).toBe(entity.id);
      expect(domain.firebaseUid).toBe(entity.firebaseUid);
      expect(domain.email).toBe(entity.email);
      expect(domain.createdAt).toBe(entity.createdAt);
    });
  });
});
