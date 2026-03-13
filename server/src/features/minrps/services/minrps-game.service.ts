import { Injectable } from '@nestjs/common';
import { MinRpsDomainMapper } from '../mapper/minrps-domain.mapper';
import { MinRpsDtoMapper } from '../mapper/minrps-dto.mapper';
import { MinRpsEntityMapper } from '../mapper/minrps-entity.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsCreateGameDto } from '../models/dtos/minrps-create-game.dto';
import { MinRpsGameDto } from '../models/dtos/minrps-game.dto';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';
import { MinRpsGameRepository } from '../repositories/minrps-game.repository';
import { MinRpsMatchRepository } from '../repositories/minrps-match.repository';

@Injectable()
export class MinRpsGameService {
  constructor(
    private readonly gameRepository: MinRpsGameRepository,
    private readonly matchRepository: MinRpsMatchRepository,
  ) {}

  public async createGame(dto: MinRpsCreateGameDto): Promise<MinRpsGameDto> {
    // Mapping
    const domain: MinRpsGame = MinRpsDtoMapper.createDtoToDomain(dto);
    const entity: MinRpsGameEntity = MinRpsDomainMapper.domainToEntity(domain);
    // Save to DB
    const savedEntity: MinRpsGameEntity = await this.gameRepository.save(entity);
    // Mapping
    const savedDomain: MinRpsGame = MinRpsEntityMapper.entityToDomain(savedEntity);
    const savedDto: MinRpsGameDto = MinRpsDomainMapper.domainToDto(savedDomain);

    return savedDto;
  }

  public async deleteGame(id: string): Promise<void> {
    await this.gameRepository.delete(id);
  }

  public async getAllGames(): Promise<MinRpsGameDto[]> {
    // Fetch from DB
    const entities: MinRpsGameEntity[] = await this.gameRepository.findAll();
    // Mapping
    const domains: MinRpsGame[] = entities
      .map((entity: MinRpsGameEntity) => MinRpsEntityMapper.entityToDomain(entity))
      .map((domain: MinRpsGame) => this.applyMatchState(domain));
    const dtos: MinRpsGameDto[] = domains.map((domain: MinRpsGame) => MinRpsDomainMapper.domainToDto(domain));

    return dtos;
  }

  public async getGame(id: string): Promise<MinRpsGameDto> {
    // Fetch from DB
    const entity = await this.gameRepository.findOne(id);
    // Mapping
    const domain: MinRpsGame = this.applyMatchState(MinRpsEntityMapper.entityToDomain(entity));
    const dto: MinRpsGameDto = MinRpsDomainMapper.domainToDto(domain);

    return dto;
  }

  private applyMatchState(domain: MinRpsGame): MinRpsGame {
    const match: MinRpsGame | null = this.matchRepository.findOne(domain.id);
    if (!match) {
      return domain;
    }

    domain.observers = match.observers;
    domain.player1 = match.player1;
    domain.player2 = match.player2;

    return domain;
  }
}
