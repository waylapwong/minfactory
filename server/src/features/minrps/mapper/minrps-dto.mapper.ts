import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsGameRequestDto } from '../models/dtos/minrps-game-request.dto';
import { MinRpsPlayDto } from '../models/dtos/minrps-play.dto';

export class MinRpsDtoMapper {
  public static dtoToDomain(dto: MinRpsGameRequestDto): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame();

    domain.name = dto.name;

    return domain;
  }

  public static playDtoToDomain(dto: MinRpsPlayDto): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame();

    domain.setPlayer1(new MinRpsPlayer());
    domain.setPlayer1Move(dto.player1Move);

    return domain;
  }
}
