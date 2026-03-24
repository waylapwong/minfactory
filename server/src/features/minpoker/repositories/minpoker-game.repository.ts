import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';

@Injectable()
export class MinPokerGameRepository {
  constructor(@InjectRepository(MinPokerGameEntity) private readonly repository: Repository<MinPokerGameEntity>) {}

  public async delete(id: string): Promise<void> {
    const entity: MinPokerGameEntity = await this.findOne(id);
    await this.repository.delete({ id: entity.id });
  }

  public async findAll(): Promise<MinPokerGameEntity[]> {
    return await this.repository.find({ relations: ['creator'], order: { createdAt: 'DESC' } });
  }

  public async findAllByCreator(creatorId: string): Promise<MinPokerGameEntity[]> {
    return await this.repository.find({
      where: { creator: { id: creatorId } },
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });
  }

  public async findOne(id: string): Promise<MinPokerGameEntity> {
    const entity: MinPokerGameEntity | null = await this.repository.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!entity) {
      throw new NotFoundException(`minPoker game with ID ${id} not found`);
    }
    return entity;
  }

  public async save(entity: MinPokerGameEntity): Promise<MinPokerGameEntity> {
    return await this.repository.save(entity);
  }
}
