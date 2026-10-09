import { MinFactoryRole } from '../../../shared/enums/minfactory-role.enum';
import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryRolePolicy } from './minfactory-role.policy';

describe('MinFactoryRolePolicy', () => {
  const policy = new MinFactoryRolePolicy();

  it('allows User and Admin roles to use user features', () => {
    const user = Object.assign(new MinFactoryUser(), { role: MinFactoryRole.User });
    const admin = Object.assign(new MinFactoryUser(), { role: MinFactoryRole.Admin });

    expect(policy.user(user)).toBe(true);
    expect(policy.user(admin)).toBe(true);
  });

  it('allows only Admin to use admin features', () => {
    const user = Object.assign(new MinFactoryUser(), { role: MinFactoryRole.User });
    const admin = Object.assign(new MinFactoryUser(), { role: MinFactoryRole.Admin });

    expect(policy.admin(user)).toBe(false);
    expect(policy.admin(admin)).toBe(true);
  });

  it('denies unauthenticated users', () => {
    expect(policy.user(null)).toBe(false);
    expect(policy.admin(null)).toBe(false);
  });
});
