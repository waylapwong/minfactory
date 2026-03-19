import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true })
  public firebaseUid: string;

  @Column({ unique: true })
  public email: string;

  @CreateDateColumn()
  public createdAt: Date;
}
