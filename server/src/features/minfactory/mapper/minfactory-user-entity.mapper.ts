import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';

export class MinFactoryUserEntityMapper {
  public static entityToDomain(entity: MinFactoryUserEntity): MinFactoryUser {
    const domain: MinFactoryUser = new MinFactoryUser();

    domain.id = entity.id;
    domain.firebaseUid = entity.firebaseUid;
    domain.email = entity.email;
    domain.createdAt = entity.createdAt;

    return domain;
  }
}
