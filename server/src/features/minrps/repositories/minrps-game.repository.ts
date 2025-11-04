import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';

@Injectable()
export class MinRpsGameRepository {
  constructor(
    @InjectRepository(MinRpsGameEntity) private readonly repository: Repository<MinRpsGameEntity>,
  ) {}

  public async deleteById(id: string): Promise<void> {
    const entity: MinRpsGameEntity = await this.findById(id);
    await this.repository.delete({ id: entity.id });
  }

  public async existsById(id: string): Promise<boolean> {
    return this.repository.existsBy({ id });
  }

  public async findAll(): Promise<MinRpsGameEntity[]> {
    return await this.repository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  public async findById(id: string): Promise<MinRpsGameEntity> {
    const entity: MinRpsGameEntity | null = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`minRPS game with ID ${id} not found`);
    }
    return entity;
  }

  public async save(entity: MinRpsGameEntity): Promise<MinRpsGameEntity> {
    const clone: MinRpsGameEntity = structuredClone(entity);
    if (!clone.id) {
      clone.id = randomUUID();
    }
    return await this.repository.save(clone);
  }
}
