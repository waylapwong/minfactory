import { MinFactoryUser } from '../models/domains/minfactory-user';
import { FirebaseUserDto } from 'src/core/authentication/models/firebase-user.dto';

export class MinFactoryUserDtoMapper {
  public static dtoToDomain(dto: FirebaseUserDto): MinFactoryUser {
    const domain: MinFactoryUser = new MinFactoryUser();

    domain.firebaseUid = dto.firebaseUid;
    domain.email = dto.email;

    return domain;
  }
}
