import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MinFactoryUserEntity } from 'src/features/minfactory/models/entities/minfactory-user.entity';

@Entity({ name: 'minpoker_games' })
export class MinPokerGameEntity {
  @Column({ type: 'int', default: 2 })
  public bigBlind: number;
  @Column({ length: 32 })
  public name: string;
  @Column({ type: 'int', default: 1 })
  public smallBlind: number;
  @Column({ type: 'int', default: 6 })
  public tableSize: number;
  @CreateDateColumn()
  public createdAt: Date;
  @PrimaryGeneratedColumn('uuid')
  public id: string;
  @ManyToOne(() => MinFactoryUserEntity, { nullable: false })
  @JoinColumn({ name: 'creator_id' })
  public creator: MinFactoryUserEntity;
}
