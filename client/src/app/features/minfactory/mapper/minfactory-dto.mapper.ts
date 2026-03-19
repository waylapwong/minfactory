import { MinFactoryUserDto } from '../../../core/generated';
import { MinFactoryUser } from '../models/domains/minfactory-user';

export class MinFactoryDtoMapper {
  public static userDtoToDomain(dto: MinFactoryUserDto): MinFactoryUser {
    const domain: MinFactoryUser = new MinFactoryUser();

    domain.createdAt = new Date(dto.createdAt);
    domain.email = dto.email;
    domain.id = dto.id;

    return domain;
  }
}
