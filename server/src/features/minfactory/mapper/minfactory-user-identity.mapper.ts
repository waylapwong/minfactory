import { FirebaseIdentityDto } from '../../../core/authentication/models/firebase-identity.dto';
import { MinFactoryUser } from '../models/domains/minfactory-user';

export class MinFactoryUserIdentityMapper {
  public static identityToDomain(identity: FirebaseIdentityDto): MinFactoryUser {
    const domain: MinFactoryUser = new MinFactoryUser();

    domain.firebaseUid = identity.uid;
    domain.email = identity.email;

    return domain;
  }
}
