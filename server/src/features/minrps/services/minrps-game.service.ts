import { Injectable } from '@nestjs/common';
import { MinRpsGameMapper } from '../mapper/minrps-game.mapper';
import { MinRpsGameRequestDto } from '../models/dtos/minrps-game-request';
import { MinRpsGameResponseDto } from '../models/dtos/minrps-game-response.dto';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';
import { MinRpsGameRepository } from '../repositories/minrps-game.repository';

@Injectable()
export class MinRpsGameService {
  constructor(private readonly gameRepository: MinRpsGameRepository) {}

  public async createGame(dto: MinRpsGameRequestDto): Promise<MinRpsGameResponseDto> {
    const entity: MinRpsGameEntity = MinRpsGameMapper.toEntityFromDto(dto);
    const savedEntity: MinRpsGameEntity = await this.gameRepository.save(entity);
    return MinRpsGameMapper.toDtoFromEntity(savedEntity);
  }

  public async deleteGame(id: string): Promise<void> {
    await this.gameRepository.deleteById(id);
  }

  public async getAllGames(): Promise<MinRpsGameResponseDto[]> {
    const entities: MinRpsGameEntity[] = await this.gameRepository.findAll();
    return entities.map((entity: MinRpsGameEntity) => MinRpsGameMapper.toDtoFromEntity(entity));
  }

  public async getGame(id: string): Promise<MinRpsGameResponseDto> {
    const entity: MinRpsGameEntity = await this.gameRepository.findById(id);
    return MinRpsGameMapper.toDtoFromEntity(entity);
  }
}
