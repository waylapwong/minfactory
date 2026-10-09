import { FirebaseUserDto } from '../../../core/authentication/models/firebase-user.dto';
import { MinFactoryUser } from '../models/domains/minfactory-user';

export class MinFactoryUserIdentityMapper {
  public static identityToDomain(identity: FirebaseUserDto): MinFactoryUser {
    const domain: MinFactoryUser = new MinFactoryUser();

    domain.firebaseUid = identity.uid;
    domain.email = identity.email;

    return domain;
  }
}
