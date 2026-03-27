import { MinFactoryRole } from '../../../../shared/enums/minfactory-role.enum';

export class MinFactoryUser {
  public createdAt: Date = new Date();
  public email: string = '';
  public role: MinFactoryRole = MinFactoryRole.User;

  constructor(init?: Partial<MinFactoryUser>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
