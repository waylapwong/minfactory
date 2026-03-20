import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryUserDto } from '../models/dtos/minfactory-user.dto';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';
import { MinFactoryUserDomainMapper } from './minfactory-user-domain.mapper';

describe('MinFactoryUserDomainMapper', () => {
  describe('domainToDto', () => {
    it('should map domain to dto correctly', () => {
      const domain: MinFactoryUser = new MinFactoryUser();
      domain.email = 'user@example.com';
      domain.createdAt = new Date('2025-01-01T00:00:00.000Z');

      const dto: MinFactoryUserDto = MinFactoryUserDomainMapper.domainToDto(domain);

      expect(dto.email).toBe(domain.email);
      expect(dto.createdAt).toBe(domain.createdAt);
    });

    it('should not expose firebaseUid in dto', () => {
      const domain: MinFactoryUser = new MinFactoryUser();
      domain.firebaseUid = 'firebase-uid-123';

      const dto: MinFactoryUserDto = MinFactoryUserDomainMapper.domainToDto(domain);

      expect((dto as any).firebaseUid).toBeUndefined();
    });

    it('should not expose id in dto', () => {
      const domain: MinFactoryUser = new MinFactoryUser();
      domain.id = '550e8400-e29b-41d4-a716-446655440000';

      const dto: MinFactoryUserDto = MinFactoryUserDomainMapper.domainToDto(domain);

      expect((dto as any).id).toBeUndefined();
    });
  });

  describe('domainToEntity', () => {
    it('should map domain to entity correctly', () => {
      const domain: MinFactoryUser = new MinFactoryUser();
      domain.firebaseUid = 'firebase-uid-123';
      domain.email = 'user@example.com';

      const entity: MinFactoryUserEntity = MinFactoryUserDomainMapper.domainToEntity(domain);

      expect(entity.firebaseUid).toBe(domain.firebaseUid);
      expect(entity.email).toBe(domain.email);
    });
  });
});
