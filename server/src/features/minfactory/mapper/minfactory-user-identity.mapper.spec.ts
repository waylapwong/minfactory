import { FirebaseIdentity } from '../../../core/authentication/models/firebase-identity';
import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryUserIdentityMapper } from './minfactory-user-identity.mapper';

describe('MinFactoryUserIdentityMapper', () => {
  it('maps Firebase identity claims to a domain user', () => {
    const identity: FirebaseIdentity = {
      email: 'user@example.com',
      uid: 'firebase-uid-123',
    };

    const domain: MinFactoryUser = MinFactoryUserIdentityMapper.identityToDomain(identity);

    expect(domain.firebaseUid).toBe(identity.uid);
    expect(domain.email).toBe(identity.email);
    expect(domain.role).toBe('user');
  });

  it('returns a new domain instance for each identity', () => {
    const identity: FirebaseIdentity = {
      email: 'user@example.com',
      uid: 'firebase-uid-123',
    };

    const domainA: MinFactoryUser = MinFactoryUserIdentityMapper.identityToDomain(identity);
    const domainB: MinFactoryUser = MinFactoryUserIdentityMapper.identityToDomain(identity);

    expect(domainA).toBeInstanceOf(MinFactoryUser);
    expect(domainA).not.toBe(domainB);
  });
});
