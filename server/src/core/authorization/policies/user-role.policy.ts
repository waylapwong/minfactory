import { Policy } from '@nestjs/authorization';
import { MinFactoryUser } from '../../../features/minfactory/models/domains/minfactory-user';
import { USER_ROLE_LEVEL } from '../constants/user-role-level.constant';
import { UserRole } from '../enums/user-role.enum';

@Policy()
export class UserRolePolicy {
  public isAdmin(user: MinFactoryUser | null): boolean {
    const userRoleLevel: number = user ? USER_ROLE_LEVEL[user.role] : 0;
    return userRoleLevel >= USER_ROLE_LEVEL[UserRole.Admin];
  }

  public isGuest(user: MinFactoryUser | null): boolean {
    const userRoleLevel: number = user ? USER_ROLE_LEVEL[user.role] : 0;
    return userRoleLevel >= USER_ROLE_LEVEL[UserRole.Guest];
  }

  public isUser(user: MinFactoryUser | null): boolean {
    const userRoleLevel: number = user ? USER_ROLE_LEVEL[user.role] : 0;
    return userRoleLevel >= USER_ROLE_LEVEL[UserRole.User];
  }
}
