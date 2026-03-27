import { MinFactoryRole } from '../../../../shared/enums/minfactory-role.enum';

export class MinFactoryProfileViewModel {
  public createdAt: string = '';
  public email: string = '';
  public role: MinFactoryRole = MinFactoryRole.User;
}
