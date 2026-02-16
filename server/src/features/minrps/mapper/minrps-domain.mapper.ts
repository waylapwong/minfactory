import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsGameDto } from '../models/dtos/minrps-game.dto';
import { MinRpsPlayResultDto } from '../models/dtos/minrps-play-result.dto';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';
import { MinRpsResult } from '../models/enums/minrps-game-result.enum';

export class MinRpsDomainMapper {
  public static domainToDto(domain: MinRpsGame): MinRpsGameDto {
    const dto: MinRpsGameDto = new MinRpsGameDto();

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

  public static domainToPlayResultDto(domain: MinRpsGame): MinRpsPlayResultDto {
    const dto: MinRpsPlayResultDto = new MinRpsPlayResultDto();

    dto.player1Move = domain.player1.move;
    dto.player2Move = domain.player2.move;
    dto.result = MinRpsResult.None;

    return dto;
  }
}
