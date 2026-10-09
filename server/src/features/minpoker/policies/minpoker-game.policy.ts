import { Policy } from '@nestjs/authorization';
import { MinFactoryRole } from '../../../shared/enums/minfactory-role.enum';
import { MinFactoryUser } from '../../minfactory/models/domains/minfactory-user';

@Policy()
export class MinPokerGamePolicy {
  public delete(user: MinFactoryUser | null, creatorId: string): boolean {
    return user !== null && (user.role === MinFactoryRole.Admin || user.id === creatorId);
  }
}
