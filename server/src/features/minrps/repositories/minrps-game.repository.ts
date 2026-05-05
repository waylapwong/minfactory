import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';

@Injectable()
export class MinRpsGameRepository {
  constructor(@InjectRepository(MinRpsGameEntity) private readonly repository: Repository<MinRpsGameEntity>) {}

  public async delete(id: string): Promise<void> {
    const entity: MinRpsGameEntity = await this.findOne(id);
    await this.repository.delete({ id: entity.id });
  }

  public async findAll(): Promise<MinRpsGameEntity[]> {
    return await this.repository.find({ order: { createdAt: 'DESC' } });
  }

  public async findOne(id: string): Promise<MinRpsGameEntity> {
    const entity: MinRpsGameEntity | null = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`minRPS game with ID ${id} not found`);
    }
    return entity;
  }

  public async save(entity: MinRpsGameEntity): Promise<MinRpsGameEntity> {
    return await this.repository.save(entity);
  }
}
