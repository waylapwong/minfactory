import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsGameDto } from '../models/dtos/minrps-game.dto';
import { MinRpsPlayResultDto } from '../models/dtos/minrps-play-result.dto';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';
import { MinRpsResult } from '../models/enums/minrps-game-result.enum';
import { MinRpsMatchUpdatedPayload } from '../models/payloads/minrps-match-updated.payload';

export class MinRpsDomainMapper {
  public static domainToDto(domain: MinRpsGame): MinRpsGameDto {
    const dto: MinRpsGameDto = new MinRpsGameDto();

    dto.createdAt = domain.createdAt;
    dto.id = domain.id;
    dto.name = domain.name;
    dto.observerCount = domain.observers.size;
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

  public static domainToMatchUpdatedPayload(domain: MinRpsGame): MinRpsMatchUpdatedPayload {
    const payload: MinRpsMatchUpdatedPayload = new MinRpsMatchUpdatedPayload();

    payload.matchId = domain.id;
    payload.observers = Array.from(domain.observers.keys());
    payload.player1Id = domain.player1.id;
    payload.player1Name = domain.player1.name;
    payload.player1Move = domain.player1.move;
    payload.player2Id = domain.player2.id;
    payload.player2Name = domain.player2.name;
    payload.player2Move = domain.player2.move;

    return payload;
  }

  public static domainToPlayResultDto(domain: MinRpsGame): MinRpsPlayResultDto {
    const dto: MinRpsPlayResultDto = new MinRpsPlayResultDto();

    dto.player1Move = domain.player1.move;
    dto.player2Move = domain.player2.move;
    dto.result = MinRpsResult.None;

    return dto;
  }
}
