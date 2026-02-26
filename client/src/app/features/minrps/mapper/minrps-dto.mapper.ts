import { MinRpsGameDto, MinRpsPlayResultDto } from '../../../core/generated';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';

export class MinRpsDtoMapper {
  public static gameDtoToDomain(dto: MinRpsGameDto): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame();

    domain.createdAt = new Date(dto.createdAt);
    domain.id = dto.id;
    domain.name = dto.name;
    for (let i = 1; i <= dto.observerCount; i++) {
      domain.observers.set(`${i}`, new MinRpsPlayer());
    }
    domain.playerCount = dto.playerCount;

    return domain;
  }

  public static playResultDtoToDomain(dto: MinRpsPlayResultDto): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame();

    domain.player1.move = dto.player1Move;
    domain.player2.move = dto.player2Move;
    domain.result = dto.result;

    return domain;
  }
}
