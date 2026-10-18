import { UserRole } from '../enums/user-role.enum';

export const USER_ROLE_LEVEL: Record<UserRole, number> = {
  [UserRole.Guest]: 0,
  [UserRole.User]: 1,
  [UserRole.Admin]: 2,
};
