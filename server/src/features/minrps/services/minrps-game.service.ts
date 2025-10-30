import { Injectable } from '@nestjs/common';

import { MinRPSGameMapper } from '../mapper/minrps-game.mapper';
import { MinRPSGameRequestDto } from '../models/dtos/minrps-game-request';
import { MinRpsGameResponseDto } from '../models/dtos/minrps-game-response.dto';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';
import { MinRPSGameRepository } from '../repositories/minrps-game.repository';

@Injectable()
export class MinRpsGameService {
  constructor(private readonly gameRepository: MinRPSGameRepository) {}

  public async createGame(dto: MinRPSGameRequestDto): Promise<MinRpsGameResponseDto> {
    const entity: MinRpsGameEntity = MinRPSGameMapper.toEntityFromDto(dto);
    const savedEntity: MinRpsGameEntity = await this.gameRepository.save(entity);
    return MinRPSGameMapper.toDtoFromEntity(savedEntity);
  }

  public async deleteGameById(id: string): Promise<void> {
    await this.gameRepository.deleteById(id);
  }

  public async getAllGames(): Promise<MinRpsGameResponseDto[]> {
    const entities: MinRpsGameEntity[] = await this.gameRepository.findAll();
    return entities.map((entity: MinRpsGameEntity) => MinRPSGameMapper.toDtoFromEntity(entity));
  }

  public async getGameById(id: string): Promise<MinRpsGameResponseDto> {
    const entity: MinRpsGameEntity = await this.gameRepository.findById(id);
    return MinRPSGameMapper.toDtoFromEntity(entity);
  }
}
