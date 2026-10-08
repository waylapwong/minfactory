import { FirebaseIdentity } from '../../../core/authentication/models/firebase-identity';
import { MinFactoryUser } from '../models/domains/minfactory-user';

export class MinFactoryUserIdentityMapper {
  public static identityToDomain(identity: FirebaseIdentity): MinFactoryUser {
    const domain: MinFactoryUser = new MinFactoryUser();

    domain.firebaseUid = identity.uid;
    domain.email = identity.email;

    return domain;
  }
}
