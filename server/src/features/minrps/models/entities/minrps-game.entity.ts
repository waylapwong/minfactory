import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'minrps_games' })
export class MinRPSGameEntity {
  @Column({
    length: 32,
    nullable: false,
    type: 'varchar',
  })
  public name: string;
  @PrimaryGeneratedColumn('uuid')
  public id: string;
}
