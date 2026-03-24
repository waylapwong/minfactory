import { Injectable } from '@nestjs/common';
import { MinPokerDomainMapper } from '../mapper/minpoker-domain.mapper';
import { MinPokerDtoMapper } from '../mapper/minpoker-dto.mapper';
import { MinPokerEntityMapper } from '../mapper/minpoker-entity.mapper';
import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerCreateGameDto } from '../models/dtos/minpoker-create-game.dto';
import { MinPokerGameDto } from '../models/dtos/minpoker-game.dto';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';
import { MinPokerGameRepository } from '../repositories/minpoker-game.repository';

@Injectable()
export class MinPokerGameService {
  constructor(private readonly gameRepository: MinPokerGameRepository) {}

  public async createGame(dto: MinPokerCreateGameDto): Promise<MinPokerGameDto> {
    // Map to Entity
    const domain: MinPokerGame = MinPokerDtoMapper.createDtoToDomain(dto);
    const entity: MinPokerGameEntity = MinPokerDomainMapper.domainToEntity(domain);
    // Save to DB
    const savedEntity: MinPokerGameEntity = await this.gameRepository.save(entity);
    // Map to DTO
    const savedDomain: MinPokerGame = MinPokerEntityMapper.entityToDomain(savedEntity);
    const savedDto: MinPokerGameDto = MinPokerDomainMapper.domainToDto(savedDomain);
    return savedDto;
  }

  public async deleteGame(id: string): Promise<void> {
    await this.gameRepository.delete(id);
  }

  public async getAllGames(): Promise<MinPokerGameDto[]> {
    // Find all Entities
    const entities: MinPokerGameEntity[] = await this.gameRepository.findAll();
    // Map to DTOs
    const domains: MinPokerGame[] = entities.map(MinPokerEntityMapper.entityToDomain);
    const dtos: MinPokerGameDto[] = domains.map(MinPokerDomainMapper.domainToDto);
    return dtos;
  }
}
