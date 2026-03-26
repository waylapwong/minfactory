import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryUserDto } from '../models/dtos/minfactory-user.dto';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';

export class MinFactoryUserDomainMapper {
  public static domainToDto(domain: MinFactoryUser): MinFactoryUserDto {
    const dto: MinFactoryUserDto = new MinFactoryUserDto();

    dto.email = domain.email;
    dto.role = domain.role;
    dto.createdAt = domain.createdAt;

    return dto;
  }

  public static domainToEntity(domain: MinFactoryUser): MinFactoryUserEntity {
    const entity: MinFactoryUserEntity = new MinFactoryUserEntity();

    entity.firebaseUid = domain.firebaseUid;
    entity.email = domain.email;

    return entity;
  }
}
