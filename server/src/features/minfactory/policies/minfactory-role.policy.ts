import { Policy } from '@nestjs/authorization';
import { MinFactoryRole } from '../../../shared/enums/minfactory-role.enum';
import { MinFactoryUser } from '../models/domains/minfactory-user';

@Policy()
export class MinFactoryRolePolicy {
  public user(user: MinFactoryUser | null): boolean {
    return user !== null && (user.role === MinFactoryRole.User || user.role === MinFactoryRole.Admin);
  }

  public admin(user: MinFactoryUser | null): boolean {
    return user?.role === MinFactoryRole.Admin;
  }
}
