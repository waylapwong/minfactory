import { MinRpsResult } from '../enums/minrps-game-result.enum';
import { MinRpsMove } from '../enums/minrps-move.enum';
import { MinRpsPlayer } from './minrps-player';
import { GameRuleException } from 'src/shared/exceptions/game-rule.exception';

export class MinRpsGame {
  public createdAt: Date = new Date();
  public id: string = crypto.randomUUID();
  public name: string = '';
  public observers: Map<string, MinRpsPlayer> = new Map<string, MinRpsPlayer>();
  public player1: MinRpsPlayer = new MinRpsPlayer();
  public player2: MinRpsPlayer = new MinRpsPlayer();

  public addObserver(observerId: string): void {
    const observer: MinRpsPlayer = new MinRpsPlayer();
    observer.id = observerId;
    this.observers.set(observerId, observer);
  }

  public addPlayer1(player: MinRpsPlayer): void {
    this.player1 = player;
  }

  public addPlayer2(player: MinRpsPlayer): void {
    this.player2 = player;
  }

  public getResult(): MinRpsResult {
    this.checkRules();
    const player1Move: MinRpsMove = this.player1.move;
    const player2Move: MinRpsMove = this.player2.move;
    if (player1Move === player2Move) {
      return MinRpsResult.Draw;
    } else {
      return player1Move === this.mapToWinningMove(player2Move)
        ? MinRpsResult.Player1
        : MinRpsResult.Player2;
    }
  }

  public isGameReady(): boolean {
    try {
      this.checkRules();
      return true;
    } catch (error: unknown) {
      if (error instanceof GameRuleException) {
        console.error('Game not ready:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      return false;
    }
  }

  public isObserver(id: string): boolean {
    return this.observers.has(id);
  }

  public isPlayer1(id: string): boolean {
    return this.player1.id === id;
  }

  public isPlayer2(id: string): boolean {
    return this.player2.id === id;
  }

  public removeObserver(observerId: string): void {
    this.observers.delete(observerId);
  }

  public removePlayer1(): void {
    this.player1 = new MinRpsPlayer();
  }

  public removePlayer2(): void {
    this.player2 = new MinRpsPlayer();
  }

  public resetPlayer1Move(): void {
    this.player1.move = MinRpsMove.None;
  }

  public resetPlayer2Move(): void {
    this.player2.move = MinRpsMove.None;
  }

  public resetPlayerMoves(): void {
    this.resetPlayer1Move();
    this.resetPlayer2Move();
  }

  public setPlayer1Move(move: MinRpsMove): void {
    if (this.player1) {
      this.player1.move = move;
    }
  }

  public setPlayer2Move(move: MinRpsMove): void {
    if (this.player2) {
      this.player2.move = move;
    }
  }

  public sitPlayer(player: MinRpsPlayer): void {
    if (this.player1.id !== '' && this.player2.id !== '') {
      throw new GameRuleException('Both player seats are already occupied.');
    }
    if (this.player1.id === '') {
      this.addPlayer1(player);
    } else if (this.player2.id === '') {
      this.addPlayer2(player);
    }
  }

  private checkRules(): void {
    if (!this.player1.id || !this.player2.id) {
      throw new GameRuleException('Both players must be seated to determine the result.');
    }
    if (this.player1.move === MinRpsMove.None || this.player2.move === MinRpsMove.None) {
      throw new GameRuleException('Player must select a move.');
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
