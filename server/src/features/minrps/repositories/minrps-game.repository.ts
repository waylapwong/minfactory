import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { LoggerService } from '../../../core/logging/services/logger.service';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';

@Injectable()
export class MinRpsGameRepository {
  private readonly logger: LoggerService = new LoggerService(MinRpsGameRepository.name);

  constructor(@InjectRepository(MinRpsGameEntity) private readonly repository: Repository<MinRpsGameEntity>) {}

  public async delete(id: string, requestId: string): Promise<boolean> {
    this.logger.debug(`START delete(id: ${id})`, requestId);
    try {
      const result: DeleteResult = await this.repository.delete({ id });
      this.logger.debug(`END delete(...)`, requestId);
      return result.affected === 1;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`FAILED delete(id: ${id}): ${errorMessage}`, requestId);
      throw error;
    }
  }

  public async findAll(requestId: string): Promise<MinRpsGameEntity[]> {
    this.logger.debug(`START findAll()`, requestId);
    try {
      const entities: MinRpsGameEntity[] = await this.repository.find({ order: { createdAt: 'DESC' } });
      this.logger.debug(`END findAll(...)`, requestId);
      return entities;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`FAILED findAll(): ${errorMessage}`, requestId);
      throw error;
    }
  }

  public async findOne(id: string, requestId: string): Promise<MinRpsGameEntity | null> {
    this.logger.debug(`START findOne(id: ${id})`, requestId);
    try {
      const entity: MinRpsGameEntity | null = await this.repository.findOne({ where: { id } });
      this.logger.debug(`END findOne(...)`, requestId);
      return entity;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`FAILED findOne(id: ${id}): ${errorMessage}`, requestId);
      throw error;
    }
  }

  public async save(entity: MinRpsGameEntity, requestId: string): Promise<MinRpsGameEntity | null> {
    this.logger.debug(`START save(entity: ${JSON.stringify(entity)})`, requestId);
    try {
      const savedEntity: MinRpsGameEntity = await this.repository.save(entity);
      this.logger.debug(`END save(...)`, requestId);
      return savedEntity;
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      this.logger.error(`FAILED save(entity: ${entity.id}): ${errorMessage}`, requestId);
      return null;
    }
  }
}
