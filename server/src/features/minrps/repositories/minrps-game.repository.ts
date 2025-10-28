import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { MinRPSGameEntity } from '../models/entities/minrps-game.entity';

@Injectable()
export class MinRPSGameRepository {
  constructor(
    @InjectRepository(MinRPSGameEntity) private readonly repository: Repository<MinRPSGameEntity>,
  ) {}

  public async deleteById(id: string): Promise<void> {
    const entity: MinRPSGameEntity = await this.findById(id);
    await this.repository.delete({ id: entity.id });
  }

  public async findAll(): Promise<MinRPSGameEntity[]> {
    return await this.repository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  public async save(entity: MinRPSGameEntity): Promise<MinRPSGameEntity> {
    const clone: MinRPSGameEntity = structuredClone(entity);
    if (!clone.id) {
      clone.id = randomUUID();
    }
    return await this.repository.save(clone);
  }

  private async findById(id: string): Promise<MinRPSGameEntity> {
    const entity: MinRPSGameEntity | null = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`minRPS game with ID ${id} not found`);
    }
    return entity;
  }
}
