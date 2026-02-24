import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsCreateGameDto } from '../models/dtos/minrps-create-game.dto';
import { MinRpsPlayDto } from '../models/dtos/minrps-play.dto';

export class MinRpsDtoMapper {
  public static createDtoToDomain(dto: MinRpsCreateGameDto): MinRpsGame {
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
