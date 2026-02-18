import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsGameDto } from '../models/dtos/minrps-game.dto';
import { MinRpsPlayResultDto } from '../models/dtos/minrps-play-result.dto';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';
import { MinRpsResult } from '../models/enums/minrps-game-result.enum';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsGameStateUpdatePayload } from '../models/payloads/minrps-game-state-update.payload';

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

  public static domainToGameStateUpdatePayload(domain: MinRpsGame): MinRpsGameStateUpdatePayload {
    const payload = new MinRpsGameStateUpdatePayload();
    payload.gameId = domain.id;
    payload.player1Id = domain.player1?.id || '';
    payload.player1Name = domain.player1?.name || '';
    payload.player1HasSelectedMove = domain.hasPlayer1SelectedMove();
    payload.player1Move = MinRpsMove.None; // Don't reveal move until both players have selected
    payload.player2Id = domain.player2?.id || '';
    payload.player2Name = domain.player2?.name || '';
    payload.player2HasSelectedMove = domain.hasPlayer2SelectedMove();
    payload.player2Move = MinRpsMove.None; // Don't reveal move until both players have selected
    return payload;
  }

  public static gameStateUpdatePayloadToDomain(payload: MinRpsGameStateUpdatePayload): MinRpsGame {
    const domain = new MinRpsGame();
    domain.id = payload.gameId;

    const player1 = new MinRpsPlayer();
    player1.id = payload.player1Id;
    player1.name = payload.player1Name;
    player1.move = payload.player1Move;
    domain.setPlayer1(player1);

    const player2 = new MinRpsPlayer();
    player2.id = payload.player2Id;
    player2.name = payload.player2Name;
    player2.move = payload.player2Move;
    domain.setPlayer2(player2);

    return domain;
  }
}
