import { Injectable } from '@nestjs/common';
import { MinRpsGameMapper } from '../mapper/minrps-game.mapper';
import { MinRpsGame } from '../models/domain/minrps-game';
import { MinRpsGameRequestDto } from '../models/dtos/minrps-game-request';
import { MinRpsGameResponseDto } from '../models/dtos/minrps-game-response.dto';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';
import { MinRpsGameRepository } from '../repositories/minrps-game.repository';
import { MinRpsMatchRepository } from '../repositories/minrps-match.repository';

@Injectable()
export class MinRpsGameService {
  constructor(
    private readonly gameRepository: MinRpsGameRepository,
    private readonly matchRepository: MinRpsMatchRepository,
  ) {}

  public async createGame(dto: MinRpsGameRequestDto): Promise<MinRpsGameResponseDto> {
    const domain: MinRpsGame = MinRpsGameMapper.toDomainFromDto(dto);
    const entity: MinRpsGameEntity = MinRpsGameMapper.toEntityFromDomain(domain);

    const savedEntity: MinRpsGameEntity = await this.gameRepository.save(entity);

    const savedDomain: MinRpsGame = MinRpsGameMapper.toDomainFromEntity(savedEntity);
    return MinRpsGameMapper.toDtofromDomain(savedDomain);
  }

  public async deleteGame(id: string): Promise<void> {
    await this.gameRepository.deleteById(id);
  }

  public async getAllGames(): Promise<MinRpsGameResponseDto[]> {
    const entities: MinRpsGameEntity[] = await this.gameRepository.findAll();
    const domains: MinRpsGame[] = entities.map((entity: MinRpsGameEntity) =>
      MinRpsGameMapper.toDomainFromEntity(entity),
    );
    return domains.map((domain: MinRpsGame) => MinRpsGameMapper.toDtofromDomain(domain));
  }

  public async getGame(id: string): Promise<MinRpsGameResponseDto> {
    const match: MinRpsGame | undefined = this.matchRepository.findById(id);
    const player1: number = match?.player1 ? 1 : 0;
    const player2: number = match?.player2 ? 1 : 0;
    const observers: number = match?.observers.length ?? 0;

    const entity: MinRpsGameEntity = await this.gameRepository.findById(id);
    const domain: MinRpsGame = MinRpsGameMapper.toDomainFromEntity(entity);
    const dto: MinRpsGameResponseDto = MinRpsGameMapper.toDtofromDomain(domain);
    dto.players = player1 + player2;
    dto.observers = observers;

    return dto;
  }
}
