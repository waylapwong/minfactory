import { Injectable } from '@nestjs/common';
import { MinRpsDomainMapper } from '../mapper/minrps-domain.mapper';
import { MinRpsEntityMapper } from '../mapper/minrps-entity.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsGameDto } from '../models/dtos/minrps-game.dto';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';
import { MinRpsGameRepository } from '../repositories/minrps-game.repository';

@Injectable()
export class MinRpsGameService {
  constructor(private readonly gameRepository: MinRpsGameRepository) {}

  public async createGame(domain: MinRpsGame): Promise<MinRpsGame> {
    return await this.gameRepository.save(domain);
  }

  public async deleteGame(id: string): Promise<void> {
    await this.gameRepository.delete(id);
  }

  public async getAllGames(): Promise<MinRpsGameDto[]> {
    // Fetch from DB
    const entites: MinRpsGameEntity[] = await this.gameRepository.findAll();
    // Mapping
    const domains: MinRpsGame[] = entites.map((entity: MinRpsGameEntity) =>
      MinRpsEntityMapper.entityToDomain(entity),
    );
    const dtos: MinRpsGameDto[] = domains.map((domain: MinRpsGame) =>
      MinRpsDomainMapper.domainToDto(domain),
    );

    return dtos;
  }

  public async getGame(id: string): Promise<MinRpsGameDto> {
    // Fetch from DB
    const entity = await this.gameRepository.findOne(id);
    // Mapping
    const domain: MinRpsGame = MinRpsEntityMapper.entityToDomain(entity);
    const dto: MinRpsGameDto = MinRpsDomainMapper.domainToDto(domain);

    return dto;
  }
}
