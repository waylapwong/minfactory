import { MinFactoryUserDto } from '../../../core/generated';
import { MinFactoryRole } from '../../../shared/enums/minfactory-role.enum';
import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryDtoMapper } from './minfactory-dto.mapper';

describe('MinFactoryDtoMapper', () => {
  describe('userDtoToDomain()', () => {
    it('should map user dto to domain', () => {
      const dto: MinFactoryUserDto = {
        createdAt: '2026-03-21T16:30:00.000Z',
        email: 'user@example.com',
        role: MinFactoryUserDto.RoleEnum.User,
      };

      const domain: MinFactoryUser = MinFactoryDtoMapper.userDtoToDomain(dto);

      expect(domain).toEqual(
        jasmine.objectContaining({
          email: 'user@example.com',
          role: MinFactoryRole.User,
        }),
      );
      expect(domain.createdAt.toISOString()).toBe('2026-03-21T16:30:00.000Z');
    });

    it('should return a MinFactoryUser instance', () => {
      const dto: MinFactoryUserDto = {
        createdAt: '2026-03-21T08:15:00.000Z',
        email: 'factory@example.com',
        role: MinFactoryUserDto.RoleEnum.User,
      };

      const domain: MinFactoryUser = MinFactoryDtoMapper.userDtoToDomain(dto);

      expect(domain instanceof MinFactoryUser).toBeTrue();
      expect(domain.createdAt instanceof Date).toBeTrue();
    });
  });
});
