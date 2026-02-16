import { MinRpsGameDto, MinRpsPlayResultDto } from '../../../core/generated';
import { MinRpsGame } from '../models/domains/minrps-game';

export class MinRpsDtoMapper {
  public static gameDtoToDomain(dto: MinRpsGameDto): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame();

    domain.createdAt = new Date(dto.createdAt);
    domain.id = dto.id;
    domain.name = dto.name;
    domain.observerCount = dto.observerCount;
    domain.playerCount = dto.playerCount;

    return domain;
  }

  public static playResultDtoToDomain(dto: MinRpsPlayResultDto): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame();

    domain.player1Move = dto.player1Move;
    domain.player2Move = dto.player2Move;
    domain.result = dto.result;

    return domain;
  }
}
