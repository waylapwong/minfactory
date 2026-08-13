import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../../core/logging/services/logger.service';
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
  private readonly logger: LoggerService = new LoggerService(MinRpsGameService.name);

  constructor(
    private readonly gameRepository: MinRpsGameRepository,
    private readonly matchRepository: MinRpsMatchRepository,
  ) {}

  public async createGame(dto: MinRpsCreateGameDto, requestId: string): Promise<MinRpsGameDto> {
    // Mapping
    const domain: MinRpsGame = MinRpsDtoMapper.createDtoToDomain(dto);
    const entity: MinRpsGameEntity = MinRpsDomainMapper.domainToEntity(domain);
    // Save to DB
    const savedEntity: MinRpsGameEntity = await this.gameRepository.save(entity, requestId);
    // Mapping
    const savedDomain: MinRpsGame = MinRpsEntityMapper.entityToDomain(savedEntity);
    const savedDto: MinRpsGameDto = MinRpsDomainMapper.domainToDto(savedDomain);

    return savedDto;
  }

  public async deleteGame(id: string, requestId: string): Promise<void> {
    await this.gameRepository.delete(id, requestId);
  }

  public async getAllGames(requestId: string): Promise<MinRpsGameDto[]> {
    // Log start
    this.logger.debug(`START getAllGames()`, requestId);
    // Get entities from DB
    const entities: MinRpsGameEntity[] = await this.gameRepository.findAll(requestId);
    // Map entities to domains
    let domains: MinRpsGame[] = entities.map((entity: MinRpsGameEntity) => MinRpsEntityMapper.entityToDomain(entity));
    // Apply match state
    domains = domains.map((domain: MinRpsGame) => this.applyMatchState(domain));
    // Map domains to DTOs
    const dtos: MinRpsGameDto[] = domains.map((domain: MinRpsGame) => MinRpsDomainMapper.domainToDto(domain));
    // Log end
    this.logger.debug(`END getAllGames(...)`, requestId);
    // Return DTOs
    return dtos;
  }

  public async getGame(id: string, requestId: string): Promise<MinRpsGameDto> {
    // Log start
    this.logger.debug(`START getGame(id: ${id})`, requestId);
    // Get Entity from DB
    const entity = await this.gameRepository.findOne(id, requestId);
    // Map Entity to Domain
    let domain: MinRpsGame = MinRpsEntityMapper.entityToDomain(entity);
    // Apply Match State
    domain = this.applyMatchState(domain);
    // Map Domain to DTO
    const dto: MinRpsGameDto = MinRpsDomainMapper.domainToDto(domain);
    // Log end
    this.logger.debug(`END getGame(...)`, requestId);
    // Return DTO
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
