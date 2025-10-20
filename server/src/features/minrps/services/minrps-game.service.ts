import { Injectable } from '@nestjs/common';

import { MinRPSGameMapper } from '../mapper/minrps-game.mapper';
import { MinRPSGameRequestDTO } from '../models/dtos/minrps-game-request';
import { MinRPSGameResponseDTO } from '../models/dtos/minrps-game-response.dto';
import { MinRPSGameEntity } from '../models/entities/minrps-game.entity';
import { MinRPSGameRepository } from '../repositories/minrps-game.repository';

@Injectable()
export class MinRPSGameService {
  constructor(private readonly repository: MinRPSGameRepository) {}

  public async createMinRPSGame(dto: MinRPSGameRequestDTO): Promise<MinRPSGameResponseDTO> {
    const entity: MinRPSGameEntity = MinRPSGameMapper.toEntityFromDTO(dto);
    const savedEntity: MinRPSGameEntity = await this.repository.save(entity);
    return MinRPSGameMapper.fromEntityToDTO(savedEntity);
  }
}
