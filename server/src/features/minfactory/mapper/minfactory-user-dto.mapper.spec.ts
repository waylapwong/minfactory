import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryUserDtoMapper } from './minfactory-user-dto.mapper';
import { FirebaseUserDto } from 'src/core/authentication/models/firebase-user.dto';

describe('MinFactoryUserDtoMapper', () => {
  describe('dtoToDomain', () => {
    it('should map firebase user dto to domain correctly', () => {
      const dto: FirebaseUserDto = {
        firebaseUid: 'firebase-uid-123',
        email: 'user@example.com',
      };

      const domain: MinFactoryUser = MinFactoryUserDtoMapper.dtoToDomain(dto);

      expect(domain.firebaseUid).toBe(dto.firebaseUid);
      expect(domain.email).toBe(dto.email);
    });

    it('should return a new domain instance', () => {
      const dto: FirebaseUserDto = {
        firebaseUid: 'firebase-uid-123',
        email: 'user@example.com',
      };

      const domainA: MinFactoryUser = MinFactoryUserDtoMapper.dtoToDomain(dto);
      const domainB: MinFactoryUser = MinFactoryUserDtoMapper.dtoToDomain(dto);

      expect(domainA).toBeInstanceOf(MinFactoryUser);
      expect(domainA).not.toBe(domainB);
    });
  });
});
