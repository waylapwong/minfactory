import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsGameRequestDto } from '../models/dtos/minrps-game-request';
import { MinRpsGameResponseDto } from '../models/dtos/minrps-game-response.dto';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';

export class MinRpsGameMapper {
  public static domainToDto(domain: MinRpsGame): MinRpsGameResponseDto {
    const dto: MinRpsGameResponseDto = new MinRpsGameResponseDto();

    dto.createdAt = domain.createdAt;
    dto.id = domain.id;
    dto.name = domain.name;
    dto.observerCount = domain.observerCount;
    dto.playerCount = (domain.player1 ? 1 : 0) + (domain.player2 ? 1 : 0);

    return dto;
  }

  public static domainToEntity(domain: MinRpsGame): MinRpsGameEntity {
    const entity: MinRpsGameEntity = new MinRpsGameEntity();

    entity.createdAt = domain.createdAt;
    entity.id = domain.id;
    entity.name = domain.name;

    return entity;
  }

  public static dtoToDomain(dto: MinRpsGameRequestDto): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame();

    domain.name = dto.name;

    return domain;
  }

  public static entityToDomain(entity: MinRpsGameEntity): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame();

    domain.createdAt = entity.createdAt;
    domain.id = entity.id;
    domain.name = entity.name;

    return domain;
  }
}
