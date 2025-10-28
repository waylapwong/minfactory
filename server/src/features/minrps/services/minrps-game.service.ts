import { Injectable } from '@nestjs/common';

import { MinRPSGameMapper } from '../mapper/minrps-game.mapper';
import { MinRPSGameRequestDTO } from '../models/dtos/minrps-game-request';
import { MinRPSGameResponseDTO } from '../models/dtos/minrps-game-response.dto';
import { MinRPSGameEntity } from '../models/entities/minrps-game.entity';
import { MinRPSGameRepository } from '../repositories/minrps-game.repository';

@Injectable()
export class MinRPSGameService {
  constructor(private readonly gameRepository: MinRPSGameRepository) {}

  public async createGame(dto: MinRPSGameRequestDTO): Promise<MinRPSGameResponseDTO> {
    const entity: MinRPSGameEntity = MinRPSGameMapper.toEntityFromDTO(dto);
    const savedEntity: MinRPSGameEntity = await this.gameRepository.save(entity);
    return MinRPSGameMapper.toDTOFromEntity(savedEntity);
  }

  public async deleteGame(id: string): Promise<void> {
    await this.gameRepository.deleteById(id);
  }

  public async getAllGames(): Promise<MinRPSGameResponseDTO[]> {
    const entities: MinRPSGameEntity[] = await this.gameRepository.findAll();
    return entities.map((entity: MinRPSGameEntity) => MinRPSGameMapper.toDTOFromEntity(entity));
  }
}
