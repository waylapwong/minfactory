import { Injectable } from '@nestjs/common';

import { MinRPSGameMapper } from '../mapper/minrps-game.mapper';
import { MinRPSGameRequestDTO } from '../models/dtos/minrps-game-request';
import { MinRPSGameResponseDTO } from '../models/dtos/minrps-game-response.dto';
import { MinRPSGameEntity } from '../models/entities/minrps-game.entity';
import { MinRPSGameRepository } from '../repositories/minrps-game.repository';

@Injectable()
export class MinRPSGameService {
  constructor(private readonly minRPSGameRepository: MinRPSGameRepository) {}

  public async createMinRPSGame(dto: MinRPSGameRequestDTO): Promise<MinRPSGameResponseDTO> {
    const entity: MinRPSGameEntity = MinRPSGameMapper.toEntityFromDTO(dto);
    const savedEntity: MinRPSGameEntity = await this.minRPSGameRepository.save(entity);
    return MinRPSGameMapper.fromEntityToDTO(savedEntity);
  }

  public async deleteMinRPSGame(id: string): Promise<void> {
    await this.minRPSGameRepository.deleteById(id);
  }

  public async getAllMinRPSGames(): Promise<MinRPSGameResponseDTO[]> {
    const entities: MinRPSGameEntity[] = await this.minRPSGameRepository.findAll();
    return entities.map((entity: MinRPSGameEntity) => MinRPSGameMapper.fromEntityToDTO(entity));
  }
}
