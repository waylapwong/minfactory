import { ForbiddenException, Injectable } from '@nestjs/common';
import { FirebaseUserDto } from '../../../core/authentication/models/firebase-user.dto';
import { LoggerService } from '../../../core/logging/services/logger.service';
import { MinFactoryRole } from '../../../shared/enums/minfactory-role.enum';
import { MinFactoryUserEntity } from '../../minfactory/models/entities/minfactory-user.entity';
import { MinFactoryUserRepository } from '../../minfactory/repositories/minfactory-user.repository';
import { MinPokerDomainMapper } from '../mapper/minpoker-domain.mapper';
import { MinPokerDtoMapper } from '../mapper/minpoker-dto.mapper';
import { MinPokerEntityMapper } from '../mapper/minpoker-entity.mapper';
import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerCreateGameDto } from '../models/dtos/minpoker-create-game.dto';
import { MinPokerGameDto } from '../models/dtos/minpoker-game.dto';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';
import { MinPokerGameVisibility } from '../models/enums/minpoker-game-visibility.enum';
import { MinPokerGameRepository } from '../repositories/minpoker-game.repository';

@Injectable()
export class MinPokerGameService {
  private readonly logger: LoggerService = new LoggerService(MinPokerGameService.name);

  constructor(
    private readonly gameRepository: MinPokerGameRepository,
    private readonly userRepository: MinFactoryUserRepository,
  ) {}

  public async createGame(dto: MinPokerCreateGameDto, firebaseUser: FirebaseUserDto, requestId: string): Promise<MinPokerGameDto> {
    this.logger.debug(`START createGame(dto: ${JSON.stringify(dto)}, firebaseUser: ${firebaseUser.uid})`, requestId);
    // FIND USER
    const userEntity: MinFactoryUserEntity = await this.userRepository.findByFirebaseUid(firebaseUser.uid);
    // MAP TO DOMAIN
    const domain: MinPokerGame = MinPokerDtoMapper.toDomain(dto);
    // UPDATE DOMAIN
    domain.creatorId = userEntity.id;
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

  public async deleteGame(id: string, firebaseUser: FirebaseUserDto, requestId: string): Promise<void> {
    this.logger.debug(`START deleteGame(id: ${id}, firebaseUser: ${firebaseUser.uid})`, requestId);
    // FIND USER
    const userEntity: MinFactoryUserEntity = await this.userRepository.findByFirebaseUid(firebaseUser.uid);
    // FIND GAME
    const gameEntity: MinPokerGameEntity = await this.gameRepository.findOne(id, requestId);
    // CHECK PERMISSIONS
    if (userEntity.id === gameEntity.creator.id || userEntity.role === MinFactoryRole.Admin) {
      // IF: DELETE GAME
      await this.gameRepository.delete(id, requestId);
      this.logger.debug(`END deleteGame(...)`, requestId);
    } else {
      // ELSE: THROW ERROR
      throw new ForbiddenException('You are not authorized to delete this game');
    }
  }

  public async getAllGames(
    firebaseUser: FirebaseUserDto,
    visibility: MinPokerGameVisibility,
    requestId: string,
  ): Promise<MinPokerGameDto[]> {
    this.logger.debug(`START getAllGames(firebaseUser: ${firebaseUser.uid}, visibility: ${visibility})`, requestId);
    let entities: MinPokerGameEntity[] = [];
    // CHECK VISIBILITY FLAG
    if (visibility && visibility === MinPokerGameVisibility.Public) {
      // GET ALL PUBLIC GAMES
      entities = await this.gameRepository.findAllPublic(requestId);
    } else {
      // GET ALL USER CREATED GAMES
      const userEntity: MinFactoryUserEntity = await this.userRepository.findByFirebaseUid(firebaseUser.uid);
      entities = await this.gameRepository.findAllByCreator(userEntity.id, requestId);
    }
    // MAP TO DTO
    const domains: MinPokerGame[] = entities.map(MinPokerEntityMapper.toDomain);
    const dtos: MinPokerGameDto[] = domains.map(MinPokerDomainMapper.toDto);
    // RETURN DTOs
    this.logger.debug(`END getAllGames(...)`, requestId);
    return dtos;
  }
}
