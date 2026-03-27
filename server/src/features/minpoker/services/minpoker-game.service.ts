import { ForbiddenException, Injectable } from '@nestjs/common';
import { MinPokerDomainMapper } from '../mapper/minpoker-domain.mapper';
import { MinPokerDtoMapper } from '../mapper/minpoker-dto.mapper';
import { MinPokerEntityMapper } from '../mapper/minpoker-entity.mapper';
import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerCreateGameDto } from '../models/dtos/minpoker-create-game.dto';
import { MinPokerGameDto } from '../models/dtos/minpoker-game.dto';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';
import { MinPokerGameRepository } from '../repositories/minpoker-game.repository';
import { FirebaseUserDto } from 'src/core/authentication/models/firebase-user.dto';
import { MinFactoryUserEntity } from 'src/features/minfactory/models/entities/minfactory-user.entity';
import { MinFactoryUserRepository } from 'src/features/minfactory/repositories/minfactory-user.repository';
import { MinFactoryRole } from 'src/shared/enums/minfactory-role.enum';

@Injectable()
export class MinPokerGameService {
  constructor(
    private readonly gameRepository: MinPokerGameRepository,
    private readonly userRepository: MinFactoryUserRepository,
  ) {}

  public async createGame(dto: MinPokerCreateGameDto, firebaseUser: FirebaseUserDto): Promise<MinPokerGameDto> {
    // Find User ID
    const userEntity: MinFactoryUserEntity = await this.userRepository.findByFirebaseUid(firebaseUser.firebaseUid);
    // Map to Entity
    const domain: MinPokerGame = MinPokerDtoMapper.createDtoToDomain(dto);
    domain.creatorId = userEntity.id;
    const entity: MinPokerGameEntity = MinPokerDomainMapper.domainToEntity(domain);
    // Save to DB
    const savedEntity: MinPokerGameEntity = await this.gameRepository.save(entity);
    // Map to DTO
    const savedDomain: MinPokerGame = MinPokerEntityMapper.entityToDomain(savedEntity);
    const savedDto: MinPokerGameDto = MinPokerDomainMapper.domainToDto(savedDomain);
    return savedDto;
  }

  public async deleteGame(id: string, firebaseUser: FirebaseUserDto): Promise<void> {
    // Find User ID
    const userEntity: MinFactoryUserEntity = await this.userRepository.findByFirebaseUid(firebaseUser.firebaseUid);
    // Find Game and verify ownership (Admin can delete any game)
    const gameEntity: MinPokerGameEntity = await this.gameRepository.findOne(id);
    if (userEntity.role !== MinFactoryRole.Admin && gameEntity.creator.id !== userEntity.id) {
      throw new ForbiddenException('You are not authorized to delete this game');
    }
    // Delete Game
    await this.gameRepository.delete(id);
  }

  public async getAllGames(firebaseUser: FirebaseUserDto): Promise<MinPokerGameDto[]> {
    // Find User and return all games for Admin, or only creator's games for others
    const userEntity: MinFactoryUserEntity = await this.userRepository.findByFirebaseUid(firebaseUser.firebaseUid);
    const entities: MinPokerGameEntity[] =
      userEntity.role === MinFactoryRole.Admin
        ? await this.gameRepository.findAll()
        : await this.gameRepository.findAllByCreator(userEntity.id);
    // Map to DTOs
    const domains: MinPokerGame[] = entities.map(MinPokerEntityMapper.entityToDomain);
    const dtos: MinPokerGameDto[] = domains.map(MinPokerDomainMapper.domainToDto);
    return dtos;
  }
}
