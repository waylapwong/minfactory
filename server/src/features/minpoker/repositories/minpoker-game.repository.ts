import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerService } from '../../../core/logging/services/logger.service';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';

@Injectable()
export class MinPokerGameRepository {
  private readonly logger: LoggerService = new LoggerService(MinPokerGameRepository.name);

  constructor(
    @InjectRepository(MinPokerGameEntity)
    private readonly repository: Repository<MinPokerGameEntity>,
  ) {}

  public async delete(id: string, requestId: string): Promise<void> {
    this.logger.debug(`START delete(id: ${id})`, requestId);
    const entity: MinPokerGameEntity = await this.findOne(id, requestId);
    await this.repository.delete({ id: entity.id });
    this.logger.debug(`END delete(...)`, requestId);
  }

  public async findAll(requestId: string): Promise<MinPokerGameEntity[]> {
    this.logger.debug(`START findAll()`, requestId);
    const entities: MinPokerGameEntity[] = await this.repository.find({ relations: ['creator'], order: { createdAt: 'DESC' } });
    this.logger.debug(`END findAll(...)`, requestId);
    return entities;
  }

  public async findAllByCreator(creatorId: string, requestId: string): Promise<MinPokerGameEntity[]> {
    this.logger.debug(`START findAllByCreator(creatorId: ${creatorId})`, requestId);
    const entities: MinPokerGameEntity[] = await this.repository.find({
      where: { creator: { id: creatorId } },
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });
    this.logger.debug(`END findAllByCreator(...)`, requestId);
    return entities;
  }

  public async findAllPublic(requestId: string): Promise<MinPokerGameEntity[]> {
    this.logger.debug(`START findAllPublic()`, requestId);
    const entities: MinPokerGameEntity[] = await this.repository.find({
      where: { isPublic: true },
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });
    this.logger.debug(`END findAllPublic(...)`, requestId);
    return entities;
  }

  public async findOne(id: string, requestId: string): Promise<MinPokerGameEntity> {
    this.logger.debug(`START findOne(id: ${id})`, requestId);
    const entity: MinPokerGameEntity | null = await this.repository.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!entity) {
      throw new NotFoundException(`minPoker game with ID ${id} not found`);
    }
    this.logger.debug(`END findOne(...)`, requestId);
    return entity;
  }

  public async save(entity: MinPokerGameEntity, requestId: string): Promise<MinPokerGameEntity> {
    this.logger.debug(`START save(entity: ${JSON.stringify(entity)})`, requestId);
    const savedEntity: MinPokerGameEntity = await this.repository.save(entity);
    this.logger.debug(`END save(...)`, requestId);
    return savedEntity;
  }
}
