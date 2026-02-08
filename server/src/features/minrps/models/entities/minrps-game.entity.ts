import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'minrps_games' })
export class MinRpsGameEntity {
  @Column({ length: 16 })
  public name: string;
  @CreateDateColumn()
  public createdAt: Date;
  @PrimaryGeneratedColumn('uuid')
  public id: string;
}
