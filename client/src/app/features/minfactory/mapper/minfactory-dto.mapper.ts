import { MinFactoryUserDto } from '../../../core/generated';
import { MinFactoryRole } from '../../../shared/enums/minfactory-role.enum';
import { MinFactoryUser } from '../models/domains/minfactory-user';

export class MinFactoryDtoMapper {
  public static userDtoToDomain(dto: MinFactoryUserDto): MinFactoryUser {
    const domain: MinFactoryUser = new MinFactoryUser();

    domain.createdAt = new Date(dto.createdAt);
    domain.email = dto.email;
    domain.role = dto.role as MinFactoryRole;

    return domain;
  }
}
