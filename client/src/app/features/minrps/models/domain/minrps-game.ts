import { MinRPSMove } from '../enums/minrps-move.enum';
import { MinRPSResult } from '../enums/minrps-result.enum';

export class MinRPSGame {
  public static readonly MAX_PLAYERS: number = 2;
  public static readonly MIN_PLAYERS: number = 2;
  public static readonly PLAYER_1_ID: string = '1';
  public static readonly PLAYER_2_ID: string = '2';

  public player1Move: MinRPSMove = MinRPSMove.None;
  public player2Move: MinRPSMove = MinRPSMove.None;

  constructor(partial?: Partial<MinRPSGame>) {
    Object.assign(this, partial);
  }

  public get result(): MinRPSResult {
    if (this.player1Move === MinRPSMove.None || this.player2Move === MinRPSMove.None) {
      return MinRPSResult.None;
    }

    if (this.player1Move === this.player2Move) {
      return MinRPSResult.Draw;
    }
    const player1Wins =
      (this.player1Move === MinRPSMove.Rock && this.player2Move === MinRPSMove.Scissors) ||
      (this.player1Move === MinRPSMove.Paper && this.player2Move === MinRPSMove.Rock) ||
      (this.player1Move === MinRPSMove.Scissors && this.player2Move === MinRPSMove.Paper);
    if (player1Wins) {
      return MinRPSResult.Player1;
    } else {
      return MinRPSResult.Player2;
    }
  }
}
