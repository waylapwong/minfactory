import { User } from '../models/domains/user';
import { UserDto } from '../models/dtos/user.dto';
import { UserEntity } from '../models/entities/user.entity';
import { UserDomainMapper } from './user-domain.mapper';

describe('UserDomainMapper', () => {
  describe('domainToDto', () => {
    it('should map domain to dto correctly', () => {
      const domain: User = new User();
      domain.id = '550e8400-e29b-41d4-a716-446655440000';
      domain.email = 'user@example.com';
      domain.createdAt = new Date('2025-01-01T00:00:00.000Z');

      const dto: UserDto = UserDomainMapper.domainToDto(domain);

      expect(dto.id).toBe(domain.id);
      expect(dto.email).toBe(domain.email);
      expect(dto.createdAt).toBe(domain.createdAt);
    });

    it('should not expose firebaseUid in dto', () => {
      const domain: User = new User();
      domain.firebaseUid = 'firebase-uid-123';

      const dto: UserDto = UserDomainMapper.domainToDto(domain);

      expect((dto as any).firebaseUid).toBeUndefined();
    });
  });

  describe('domainToEntity', () => {
    it('should map domain to entity correctly', () => {
      const domain: User = new User();
      domain.firebaseUid = 'firebase-uid-123';
      domain.email = 'user@example.com';

      const entity: UserEntity = UserDomainMapper.domainToEntity(domain);

      expect(entity.firebaseUid).toBe(domain.firebaseUid);
      expect(entity.email).toBe(domain.email);
    });
  });
});
