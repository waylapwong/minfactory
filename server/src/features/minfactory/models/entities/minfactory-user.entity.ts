import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../../../../core/authorization/enums/user-role.enum';

@Entity({ name: 'minfactory_users' })
export class MinFactoryUserEntity {
  @Column({ unique: true })
  public email!: string;
  @Column({ unique: true })
  public firebaseUid!: string;
  @Column({ default: UserRole.User })
  public role!: UserRole;
  @CreateDateColumn()
  public createdAt!: Date;
  @PrimaryGeneratedColumn('uuid')
  public id!: string;
}
