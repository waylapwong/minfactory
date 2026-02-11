import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsPlayDto } from '../models/dtos/minrps-play.dto';
import { MinRpsPlayResultDto } from '../models/dtos/minrps-play-result.dto';
import { MinRpsResult } from '../models/enums/minrps-game-result.enum';

export class MinRpsMatchMapper {
  public static domainToPlayResultDto(domain: MinRpsGame): MinRpsPlayResultDto {
    const dto: MinRpsPlayResultDto = new MinRpsPlayResultDto();

    dto.player1Move = domain.player1.move;
    dto.player2Move = domain.player2.move;
    dto.result = MinRpsResult.None;

    return dto;
  }

  public static playDtoToDomain(dto: MinRpsPlayDto): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame();

    domain.setPlayer1(new MinRpsPlayer());
    domain.setPlayer1Move(dto.player1Move);

    return domain;
  }
}
