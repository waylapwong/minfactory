import { MinFactoryRole } from '../../../../shared/enums/minfactory-role.enum';

export class MinFactoryUser {
  public createdAt: Date = new Date();
  public email: string = '';
  public firebaseUid: string = '';
  public id: string = '';
  public role: MinFactoryRole = MinFactoryRole.User;
}
