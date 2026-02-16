import { MinRpsMove, MinRpsResult } from '../../../../core/generated';

export class MinRpsGame {
  public createdAt: Date = new Date();
  public id: string = '';
  public name: string = '';
  public observerCount: number = 0;
  public player1Move: MinRpsMove = MinRpsMove.None;
  public player1SelectedMove: MinRpsMove = MinRpsMove.None;
  public player2Move: MinRpsMove = MinRpsMove.None;
  public player2SelectedMove: MinRpsMove = MinRpsMove.None;
  public playerCount: number = 0;
  public result: MinRpsResult = MinRpsResult.None;

  constructor(init?: Partial<MinRpsGame>) {
    Object.assign(this, init);
  }

  public setPlayer1Move(move: MinRpsMove): void {
    this.player1Move = move;
  }

  public setPlayer1SelectedMove(move: MinRpsMove): void {
    this.player1SelectedMove = move;
  }

  public setPlayer2Move(move: MinRpsMove): void {
    this.player2Move = move;
  }

  public setPlayer2SelectedMove(move: MinRpsMove): void {
    this.player2SelectedMove = move;
  }
}
