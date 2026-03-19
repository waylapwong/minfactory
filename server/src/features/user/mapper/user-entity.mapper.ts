import { User } from '../models/domains/user';
import { UserEntity } from '../models/entities/user.entity';

export class UserEntityMapper {
  public static entityToDomain(entity: UserEntity): User {
    const domain: User = new User();

    domain.id = entity.id;
    domain.firebaseUid = entity.firebaseUid;
    domain.email = entity.email;
    domain.createdAt = entity.createdAt;

    return domain;
  }
}
