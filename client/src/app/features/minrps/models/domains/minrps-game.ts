import { MinRpsMove } from '../enums/minrps-move.enum';
import { MinRpsResult } from '../enums/minrps-result.enum';

export class MinRpsGame {
  public static readonly MAX_PLAYERS: number = 2;
  public static readonly MIN_PLAYERS: number = 2;
  public static readonly PLAYER_1_ID: string = '1';
  public static readonly PLAYER_2_ID: string = '2';

  public createdAt: Date = new Date();
  public id: string = crypto.randomUUID();
  public name: string = '';
  public observerCount: number = 0;
  public player1Move: MinRpsMove = MinRpsMove.None;
  public player2Move: MinRpsMove = MinRpsMove.None;
  public playerCount: number = 0;

  constructor(partial?: Partial<MinRpsGame>) {
    Object.assign(this, partial);
  }

  public get result(): MinRpsResult {
    if (this.player1Move === MinRpsMove.None || this.player2Move === MinRpsMove.None) {
      return MinRpsResult.None;
    }

    if (this.player1Move === this.player2Move) {
      return MinRpsResult.Draw;
    }
    const player1Wins =
      (this.player1Move === MinRpsMove.Rock && this.player2Move === MinRpsMove.Scissors) ||
      (this.player1Move === MinRpsMove.Paper && this.player2Move === MinRpsMove.Rock) ||
      (this.player1Move === MinRpsMove.Scissors && this.player2Move === MinRpsMove.Paper);
    if (player1Wins) {
      return MinRpsResult.Player1;
    } else {
      return MinRpsResult.Player2;
    }
  }
}
