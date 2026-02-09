import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsMatchRequestDto } from '../models/dtos/minrps-match-request.dto';
import { MinRpsMatchResponseDto } from '../models/dtos/minrps-match-response.dto';
import { MinRpsResult } from '../models/enums/minrps-game-result.enum';

export class MinRpsMatchMapper {
  public static domainToDto(domain: MinRpsGame): MinRpsMatchResponseDto {
    const dto: MinRpsMatchResponseDto = new MinRpsMatchResponseDto();

    dto.player1Move = domain.player1.move;
    dto.player2Move = domain.player2.move;
    dto.result = MinRpsResult.None;

    return dto;
  }

  public static dtoToDomain(dto: MinRpsMatchRequestDto): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame();

    domain.setPlayer1(new MinRpsPlayer());
    domain.setPlayer1Move(dto.player1Move);

    return domain;
  }
}
