import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'minrps_games' })
export class MinRpsGameEntity {
  @Column({
    length: 32,
    nullable: false,
    type: 'varchar',
  })
  public name: string;
  @Column({
    type: 'datetime',
    nullable: false,
  })
  public createdAt: Date;
  @PrimaryGeneratedColumn('uuid')
  public id: string;
}
