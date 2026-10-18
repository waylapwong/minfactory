import { UserRole } from '../../../../core/authorization/enums/user-role.enum';

export class MinFactoryUser {
  public createdAt: Date = new Date();
  public email: string = '';
  public firebaseUid: string = '';
  public id: string = '';
  public role: UserRole = UserRole.User;
}
