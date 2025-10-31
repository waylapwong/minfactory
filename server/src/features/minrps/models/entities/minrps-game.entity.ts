import { Column, Entity, PrimaryColumn } from 'typeorm';

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
  @PrimaryColumn('uuid')
  public id: string;
}
