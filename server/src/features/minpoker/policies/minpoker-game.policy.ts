import { Policy } from '@nestjs/authorization';
import { UserRole } from '../../../core/authorization/enums/user-role.enum';
import { MinFactoryUser } from '../../minfactory/models/domains/minfactory-user';

@Policy()
export class MinPokerGamePolicy {
  public delete(user: MinFactoryUser | null, creatorId: string): boolean {
    return user !== null && (user.role === UserRole.Admin || user.id === creatorId);
  }
}
