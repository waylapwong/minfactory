import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MinRpsDomainMapper } from '../mapper/minrps-domain.mapper';
import { MinRpsEntityMapper } from '../mapper/minrps-entity.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';

@Injectable()
export class MinRpsGameRepository {
  constructor(
    @InjectRepository(MinRpsGameEntity) private readonly repository: Repository<MinRpsGameEntity>,
  ) {}

  public async delete(id: string): Promise<void> {
    const entity: MinRpsGameEntity = await this.find(id);
    await this.repository.delete({ id: entity.id });
  }

  public async find(id: string): Promise<MinRpsGame> {
    const entity: MinRpsGameEntity | null = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`minRPS game with ID ${id} not found`);
    }
    return MinRpsEntityMapper.entityToDomain(entity);
  }

  public async findAll(): Promise<MinRpsGame[]> {
    const entites: MinRpsGameEntity[] = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return entites.map((entity: MinRpsGameEntity) => {
      return MinRpsEntityMapper.entityToDomain(entity);
    });
  }

  public async save(domain: MinRpsGame): Promise<MinRpsGame> {
    const entity: MinRpsGameEntity = MinRpsDomainMapper.domainToEntity(domain);
    const savedEntity: MinRpsGameEntity = await this.repository.save(entity);
    return MinRpsEntityMapper.entityToDomain(savedEntity);
  }
}
