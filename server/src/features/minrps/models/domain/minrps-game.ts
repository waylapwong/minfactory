import { MinRpsResult } from '../enums/minrps-game-result.enum';
import { MinRpsMove } from '../enums/minrps-move.enum';
import { MinRpsPlayer } from './minrps-player';
import { randomUUID } from 'crypto';
import { GameRuleException } from 'src/shared/exceptions/game-rule.exception';

export class MinRpsGame {
  private readonly winsAgainst: Record<MinRpsMove, MinRpsMove> = {
    [MinRpsMove.Rock]: MinRpsMove.Scissors,
    [MinRpsMove.Paper]: MinRpsMove.Rock,
    [MinRpsMove.Scissors]: MinRpsMove.Paper,
  };

  public createdAt: Date;
  public id: string;
  public name: string;
  public player1?: MinRpsPlayer;
  public player2?: MinRpsPlayer;
  public result?: MinRpsResult;

  constructor(name: string) {
    this.createdAt = new Date();
    this.id = randomUUID();
    this.name = name;
  }

  public determineResult(): void {
    this.validateRules();

    const move1 = this.player1!.move!;
    const move2 = this.player2!.move!;

    if (move1 === move2) {
      this.result = MinRpsResult.Draw;
      return;
    }

    this.result = this.winsAgainst[move1] === move2 ? MinRpsResult.Player1 : MinRpsResult.Player2;
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

  private validateRules(): void {
    if (!this.player1 || !this.player2) {
      throw new GameRuleException('Both players must be set before determining the result.');
    }
    if (!this.player1.move || !this.player2.move) {
      throw new GameRuleException('Both players must make a move before determining the result.');
    }
  }
}
