import { MinFactoryRole } from '../../../core/authorization/minfactory-role.enum';
import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryRolePolicy } from './minfactory-role.policy';

describe('MinFactoryRolePolicy', () => {
  const policy = new MinFactoryRolePolicy();

  describe('isAdmin()', () => {
    it('allows Admin', () => {
      const admin = Object.assign(new MinFactoryUser(), { role: MinFactoryRole.Admin });

      expect(policy.isAdmin(admin)).toBe(true);
    });

    it('denies Guest and User', () => {
      const guest = Object.assign(new MinFactoryUser(), { role: MinFactoryRole.Guest });
      const user = Object.assign(new MinFactoryUser(), { role: MinFactoryRole.User });

      expect(policy.isAdmin(guest)).toBe(false);
      expect(policy.isAdmin(user)).toBe(false);
    });

    it('denies unauthenticated users', () => {
      expect(policy.isAdmin(null)).toBe(false);
    });
  });

  describe('isGuest()', () => {
    it('allows Guest, User, and Admin', () => {
      const guest = Object.assign(new MinFactoryUser(), { role: MinFactoryRole.Guest });
      const user = Object.assign(new MinFactoryUser(), { role: MinFactoryRole.User });
      const admin = Object.assign(new MinFactoryUser(), { role: MinFactoryRole.Admin });

      expect(policy.isGuest(guest)).toBe(true);
      expect(policy.isGuest(user)).toBe(true);
      expect(policy.isGuest(admin)).toBe(true);
    });

    it('allows unauthenticated users at Guest level', () => {
      expect(policy.isGuest(null)).toBe(true);
    });
  });

  describe('isUser()', () => {
    it('allows User and Admin', () => {
      const user = Object.assign(new MinFactoryUser(), { role: MinFactoryRole.User });
      const admin = Object.assign(new MinFactoryUser(), { role: MinFactoryRole.Admin });

      expect(policy.isUser(user)).toBe(true);
      expect(policy.isUser(admin)).toBe(true);
    });

    it('denies Guest', () => {
      const guest = Object.assign(new MinFactoryUser(), { role: MinFactoryRole.Guest });

      expect(policy.isUser(guest)).toBe(false);
    });

    it('denies unauthenticated users', () => {
      expect(policy.isUser(null)).toBe(false);
    });
  });
});
