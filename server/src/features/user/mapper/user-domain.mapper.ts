import { User } from '../models/domains/user';
import { UserDto } from '../models/dtos/user.dto';
import { UserEntity } from '../models/entities/user.entity';

export class UserDomainMapper {
  public static domainToDto(domain: User): UserDto {
    const dto: UserDto = new UserDto();

    dto.id = domain.id;
    dto.email = domain.email;
    dto.createdAt = domain.createdAt;

    return dto;
  }

  public static domainToEntity(domain: User): UserEntity {
    const entity: UserEntity = new UserEntity();

    entity.firebaseUid = domain.firebaseUid;
    entity.email = domain.email;

    return entity;
  }
}
