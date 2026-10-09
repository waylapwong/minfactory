import { Injectable } from '@nestjs/common';
import { AuthorizationService } from '@nestjs/authorization';
import { LoggerService } from '../../../core/logging/services/logger.service';
import { MinFactoryUser } from '../../minfactory/models/domains/minfactory-user';
import { MinPokerDomainMapper } from '../mapper/minpoker-domain.mapper';
import { MinPokerDtoMapper } from '../mapper/minpoker-dto.mapper';
import { MinPokerEntityMapper } from '../mapper/minpoker-entity.mapper';
import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerCreateGameDto } from '../models/dtos/minpoker-create-game.dto';
import { MinPokerGameDto } from '../models/dtos/minpoker-game.dto';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';
import { MinPokerGameVisibility } from '../models/enums/minpoker-game-visibility.enum';
import { MinPokerGamePolicy } from '../policies/minpoker-game.policy';
import { MinPokerGameRepository } from '../repositories/minpoker-game.repository';

@Injectable()
export class MinPokerGameService {
  private readonly logger: LoggerService = new LoggerService(MinPokerGameService.name);

  constructor(
    private readonly gameRepository: MinPokerGameRepository,
    private readonly authorizationService: AuthorizationService,
  ) {}

  public async createGame(dto: MinPokerCreateGameDto, user: MinFactoryUser, requestId: string): Promise<MinPokerGameDto> {
    this.logger.debug(`START createGame(dto: ${JSON.stringify(dto)}, userId: ${user.id})`, requestId);
    // MAP TO DOMAIN
    const domain: MinPokerGame = MinPokerDtoMapper.toDomain(dto);
    // UPDATE DOMAIN
    domain.creatorId = user.id;
    // SAVE TO DATABASE
    const entity: MinPokerGameEntity = MinPokerDomainMapper.toEntity(domain);
    const savedEntity: MinPokerGameEntity = await this.gameRepository.save(entity, requestId);
    // MAP TO DTO
    const savedDomain: MinPokerGame = MinPokerEntityMapper.toDomain(savedEntity);
    const savedDto: MinPokerGameDto = MinPokerDomainMapper.toDto(savedDomain);
    // RETURN DTO
    this.logger.debug(`END createGame(...)`, requestId);
    return savedDto;
  }

  public async deleteGame(id: string, user: MinFactoryUser, requestId: string): Promise<void> {
    this.logger.debug(`START deleteGame(id: ${id}, userId: ${user.id})`, requestId);
    // FIND GAME
    const gameEntity: MinPokerGameEntity = await this.gameRepository.findOne(id, requestId);
    await this.authorizationService.authorize(MinPokerGamePolicy, 'delete', user, gameEntity.creator.id);
    await this.gameRepository.delete(id, requestId);
    this.logger.debug(`END deleteGame(...)`, requestId);
  }

  public async getAllGames(user: MinFactoryUser, visibility: MinPokerGameVisibility, requestId: string): Promise<MinPokerGameDto[]> {
    this.logger.debug(`START getAllGames(userId: ${user.id}, visibility: ${visibility})`, requestId);
    let entities: MinPokerGameEntity[] = [];
    // CHECK VISIBILITY FLAG
    if (visibility === MinPokerGameVisibility.Public) {
      // GET ALL PUBLIC GAMES
      entities = await this.gameRepository.findAllPublic(requestId);
    } else {
      // GET ALL USER CREATED GAMES
      entities = await this.gameRepository.findAllByCreator(user.id, requestId);
    }
    // MAP TO DTO
    const domains: MinPokerGame[] = entities.map(MinPokerEntityMapper.toDomain);
    const dtos: MinPokerGameDto[] = domains.map(MinPokerDomainMapper.toDto);
    // RETURN DTOs
    this.logger.debug(`END getAllGames(...)`, requestId);
    return dtos;
  }
}
