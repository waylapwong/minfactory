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

    const player1: MinRpsPlayer = new MinRpsPlayer();
    player1.id = 'player-1';
    player1.name = 'Player 1';
    domain.setPlayer1(player1);
    domain.setPlayer1Move(dto.player1Move);

    return domain;
  }
}
