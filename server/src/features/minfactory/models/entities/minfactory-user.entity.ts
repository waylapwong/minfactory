import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'minfactory_users' })
export class MinFactoryUserEntity {
  @Column({ unique: true })
  public email: string;
  @Column({ unique: true })
  public firebaseUid: string;
  @CreateDateColumn()
  public createdAt: Date;
  @PrimaryGeneratedColumn('uuid')
  public id: string;
}
