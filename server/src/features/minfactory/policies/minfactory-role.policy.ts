import { Policy } from '@nestjs/authorization';
import { MINFACTORY_ROLE_LEVEL } from '../../../core/authorization/minfactory-role-level';
import { MinFactoryRole } from '../../../core/authorization/minfactory-role.enum';
import { MinFactoryUser } from '../models/domains/minfactory-user';

@Policy()
export class MinFactoryRolePolicy {
  public isAdmin(user: MinFactoryUser | null): boolean {
    const userLevel: number = user ? MINFACTORY_ROLE_LEVEL[user.role] : 0;
    return userLevel >= MINFACTORY_ROLE_LEVEL[MinFactoryRole.Admin];
  }

  public isGuest(user: MinFactoryUser | null): boolean {
    const userLevel: number = user ? MINFACTORY_ROLE_LEVEL[user.role] : 0;
    return userLevel >= MINFACTORY_ROLE_LEVEL[MinFactoryRole.Guest];
  }

  public isUser(user: MinFactoryUser | null): boolean {
    const userLevel: number = user ? MINFACTORY_ROLE_LEVEL[user.role] : 0;
    return userLevel >= MINFACTORY_ROLE_LEVEL[MinFactoryRole.User];
  }
}
