import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerService } from '../../../core/logging/services/logger.service';
import { MinFactoryUserEntity } from '../models/entities/minfactory-user.entity';

@Injectable()
export class MinFactoryUserRepository {
  private readonly logger: LoggerService = new LoggerService(MinFactoryUserRepository.name);

  constructor(
    @InjectRepository(MinFactoryUserEntity)
    private readonly repository: Repository<MinFactoryUserEntity>,
  ) {}

  public async deleteByFirebaseUid(firebaseUid: string, requestId: string): Promise<void> {
    this.logger.debug(`START deleteByFirebaseUid(firebaseUid: ${firebaseUid})`, requestId);
    const entity: MinFactoryUserEntity = await this.findByFirebaseUid(firebaseUid, requestId);
    await this.repository.remove(entity);
    this.logger.debug(`END deleteByFirebaseUid(...)`, requestId);
  }

  public async findByEmail(email: string, requestId: string): Promise<MinFactoryUserEntity> {
    this.logger.debug(`START findByEmail(email: ${email})`, requestId);
    const entity: MinFactoryUserEntity | null = await this.repository.findOne({
      where: { email },
    });
    if (!entity) {
      throw new NotFoundException('User not found');
    }
    this.logger.debug(`END findByEmail(...)`, requestId);
    return entity;
  }

  public async findByFirebaseUid(firebaseUid: string, requestId: string): Promise<MinFactoryUserEntity> {
    this.logger.debug(`START findByFirebaseUid(firebaseUid: ${firebaseUid})`, requestId);
    const entity: MinFactoryUserEntity | null = await this.repository.findOne({
      where: { firebaseUid },
    });
    if (!entity) {
      throw new NotFoundException('User not found');
    }
    this.logger.debug(`END findByFirebaseUid(...)`, requestId);
    return entity;
  }

  public async save(entity: MinFactoryUserEntity, requestId: string): Promise<MinFactoryUserEntity> {
    this.logger.debug(`START save(entity: ${JSON.stringify(entity)})`, requestId);
    const savedEntity: MinFactoryUserEntity = await this.repository.save(entity);
    this.logger.debug(`END save(...)`, requestId);
    return savedEntity;
  }
}
