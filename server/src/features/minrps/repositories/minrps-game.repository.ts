import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerService } from '../../../core/logging/services/logger.service';
import { MinRpsGameNotFoundException } from '../errors/exceptions/minrps-game-not-found.exceptions';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';

@Injectable()
export class MinRpsGameRepository {
  private readonly logger: LoggerService = new LoggerService(MinRpsGameRepository.name);

  constructor(@InjectRepository(MinRpsGameEntity) private readonly repository: Repository<MinRpsGameEntity>) {}

  public async delete(id: string, requestId: string): Promise<void> {
    this.logger.debug(`START delete(id: ${id})`, requestId);
    const entity: MinRpsGameEntity = await this.findOne(id, requestId);
    await this.repository.delete({ id: entity.id });
    this.logger.debug(`END delete(...)`, requestId);
  }

  public async findAll(requestId: string): Promise<MinRpsGameEntity[]> {
    this.logger.debug(`START findAll()`, requestId);
    const entities: MinRpsGameEntity[] = await this.repository.find({ order: { createdAt: 'DESC' } });
    this.logger.debug(`END findAll(...)`, requestId);
    return entities;
  }

  public async findOne(id: string, requestId: string): Promise<MinRpsGameEntity> {
    this.logger.debug(`START findOne(id: ${id})`, requestId);
    const entity: MinRpsGameEntity | null = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new MinRpsGameNotFoundException(id, requestId);
    }
    this.logger.debug(`END findOne(...)`, requestId);
    return entity;
  }

  public async save(entity: MinRpsGameEntity, requestId: string): Promise<MinRpsGameEntity> {
    this.logger.debug(`START save(entity: ${JSON.stringify(entity)})`, requestId);
    const savedEntity: MinRpsGameEntity = await this.repository.save(entity);
    this.logger.debug(`END save(...)`, requestId);
    return savedEntity;
  }
}
