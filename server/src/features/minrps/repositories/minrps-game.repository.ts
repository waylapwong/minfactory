import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { MinRPSGameEntity } from '../models/entities/minrps-game.entity';

@Injectable()
export class MinRPSGameRepository {
  constructor(
    @InjectRepository(MinRPSGameEntity) private readonly repository: Repository<MinRPSGameEntity>,
  ) {}

  public async save(entity: MinRPSGameEntity): Promise<MinRPSGameEntity> {
    const clone: MinRPSGameEntity = structuredClone(entity);

    if (!clone.id) {
      clone.id = randomUUID();
    }

    return await this.repository.save(clone);
  }
}
