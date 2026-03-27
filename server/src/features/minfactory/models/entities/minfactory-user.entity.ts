import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { MinFactoryRole } from 'src/shared/enums/minfactory-role.enum';

@Entity({ name: 'minfactory_users' })
export class MinFactoryUserEntity {
  @Column({ unique: true })
  public email: string;
  @Column({ unique: true })
  public firebaseUid: string;
  @Column({ default: MinFactoryRole.User })
  public role: MinFactoryRole;
  @CreateDateColumn()
  public createdAt: Date;
  @PrimaryGeneratedColumn('uuid')
  public id: string;
}
