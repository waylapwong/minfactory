import { MinRpsResult } from '../enums/minrps-game-result.enum';
import { MinRpsMove } from '../enums/minrps-move.enum';
import { MinRpsPlayer } from './minrps-player';
import { GameRuleException } from 'src/shared/exceptions/game-rule.exception';

export class MinRpsGame {
  public createdAt: Date = new Date();
  public id: string = crypto.randomUUID();
  public name: string = '';
  public observerCount: number = 0;
  public player1: MinRpsPlayer | null = null;
  public player2: MinRpsPlayer | null = null;

  public addObserver(): void {
    this.observerCount++;
  }

  public getResult(): MinRpsResult {
    this.checkRules();
    const player1Move: MinRpsMove = this.player1!.move;
    const player2Move: MinRpsMove = this.player2!.move;
    if (player1Move === player2Move) {
      return MinRpsResult.Draw;
    } else {
      return player1Move === this.mapToWinningMove(player2Move)
        ? MinRpsResult.Player1
        : MinRpsResult.Player2;
    }
  }

  public setPlayer1(player: MinRpsPlayer): void {
    this.player1 = player;
  }

  public setPlayer1Move(move: MinRpsMove): void {
    if (this.player1) {
      this.player1.move = move;
    }
  }

  public setPlayer2(player: MinRpsPlayer): void {
    this.player2 = player;
  }

  public setPlayer2Move(move: MinRpsMove): void {
    if (this.player2) {
      this.player2.move = move;
    }
  }

  private checkRules(): void {
    if (!this.player1 || !this.player2) {
      throw new GameRuleException('Both players must be set before determining the result.');
    }
    if (!this.player1.move || !this.player2.move) {
      throw new GameRuleException('Both players must make a move before determining the result.');
    }
  }

  private mapToWinningMove(losingMove: MinRpsMove): MinRpsMove {
    switch (losingMove) {
      case MinRpsMove.Rock:
        return MinRpsMove.Paper;
      case MinRpsMove.Paper:
        return MinRpsMove.Scissors;
      case MinRpsMove.Scissors:
        return MinRpsMove.Rock;
      default:
        return MinRpsMove.None;
    }
  }
}
