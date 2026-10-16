import { MinFactoryUser } from '../../../features/minfactory/models/domains/minfactory-user';
import { UserRole } from '../enums/user-role.enum';
import { UserRolePolicy } from './user-role.policy';

describe('UserRolePolicy', () => {
  const policy = new UserRolePolicy();

  describe('isAdmin()', () => {
    it('should allow users with "Admin" role', () => {
      const admin = Object.assign(new MinFactoryUser(), { role: UserRole.Admin });
      expect(policy.isAdmin(admin)).toBe(true);
    });

    it('should deny users with "Guest" and "User" roles', () => {
      const guest = Object.assign(new MinFactoryUser(), { role: UserRole.Guest });
      const user = Object.assign(new MinFactoryUser(), { role: UserRole.User });
      expect(policy.isAdmin(guest)).toBe(false);
      expect(policy.isAdmin(user)).toBe(false);
    });

    it('should deny unauthenticated users', () => {
      expect(policy.isAdmin(null)).toBe(false);
    });
  });

  describe('isGuest()', () => {
    it('should allow users with "Guest", "User", and "Admin" roles', () => {
      const guest = Object.assign(new MinFactoryUser(), { role: UserRole.Guest });
      const user = Object.assign(new MinFactoryUser(), { role: UserRole.User });
      const admin = Object.assign(new MinFactoryUser(), { role: UserRole.Admin });
      expect(policy.isGuest(guest)).toBe(true);
      expect(policy.isGuest(user)).toBe(true);
      expect(policy.isGuest(admin)).toBe(true);
    });

    it('should allow unauthenticated users at Guest level', () => {
      expect(policy.isGuest(null)).toBe(true);
    });
  });

  describe('isUser()', () => {
    it('should allow users with "User" and "Admin" roles', () => {
      const user = Object.assign(new MinFactoryUser(), { role: UserRole.User });
      const admin = Object.assign(new MinFactoryUser(), { role: UserRole.Admin });
      expect(policy.isUser(user)).toBe(true);
      expect(policy.isUser(admin)).toBe(true);
    });

    it('should deny users with "Guest" role', () => {
      const guest = Object.assign(new MinFactoryUser(), { role: UserRole.Guest });
      expect(policy.isUser(guest)).toBe(false);
    });

    it('should deny unauthenticated users', () => {
      expect(policy.isUser(null)).toBe(false);
    });
  });
});
