import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'minrps_games' })
export class MinRpsGameEntity {
  @Column({
    length: 32,
    nullable: false,
    type: 'varchar',
  })
  public name: string;
  @CreateDateColumn({
    default: () => 'CURRENT_TIMESTAMP',
    type: 'datetime',
  })
  public createdAt: Date;
  @PrimaryGeneratedColumn('uuid')
  public id: string;
}
