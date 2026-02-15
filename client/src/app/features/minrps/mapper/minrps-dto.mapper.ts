import { MinRPSGame } from '../models/domain/minrps-game';
import { MinRPSMove } from '../models/enums/minrps-move.enum';

export interface MinRPSGameDto {
  player1Move: string;
  player2Move: string;
}

export class MinRPSDtoMapper {
  public static toDomain(dto: MinRPSGameDto): MinRPSGame {
    return new MinRPSGame({
      player1Move: this.toMove(dto.player1Move),
      player2Move: this.toMove(dto.player2Move),
    });
  }

  public static toDto(game: MinRPSGame): MinRPSGameDto {
    return {
      player1Move: game.player1Move,
      player2Move: game.player2Move,
    };
  }

  private static toMove(move: string): MinRPSMove {
    switch (move) {
      case MinRPSMove.Rock:
      case MinRPSMove.Paper:
      case MinRPSMove.Scissors:
      case MinRPSMove.None:
        return move;
      default:
        return MinRPSMove.None;
    }
  }
}
