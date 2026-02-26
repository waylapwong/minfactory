import { MinRpsMove, MinRpsResult } from '../../../../core/generated';
import { MinRpsPlayer } from './minrps-player';

export class MinRpsGame {
  public createdAt: Date = new Date();
  public id: string = '';
  public name: string = '';
  public observers: Map<string, MinRpsPlayer> = new Map();
  public player1: MinRpsPlayer = new MinRpsPlayer();
  public player2: MinRpsPlayer = new MinRpsPlayer();
  public playerCount: number = 0;
  public result: MinRpsResult = MinRpsResult.None;

  constructor(init?: Partial<MinRpsGame>) {
    if (init) {
      Object.assign(this, init);
    }
  }

  public get observerCount(): number {
    return this.observers.size;
  }

  public get player1Move(): MinRpsMove {
    return this.player1.move;
  }

  public set player1Move(move: MinRpsMove) {
    this.player1.move = move;
  }

  public get player1SelectedMove(): MinRpsMove {
    return this.player1.selectedMove;
  }

  public set player1SelectedMove(move: MinRpsMove) {
    this.player1.selectedMove = move;
  }

  public get player2Move(): MinRpsMove {
    return this.player2.move;
  }

  public set player2Move(move: MinRpsMove) {
    this.player2.move = move;
  }

  public get player2SelectedMove(): MinRpsMove {
    return this.player2.selectedMove;
  }

  public set player2SelectedMove(move: MinRpsMove) {
    this.player2.selectedMove = move;
  }

  public setPlayer1(player: MinRpsPlayer): void {
    this.player1 = player;
  }

  public setPlayer1Move(move: MinRpsMove): void {
    this.player1.move = move;
  }

  public setPlayer1SelectedMove(move: MinRpsMove): void {
    this.player1.selectedMove = move;
  }

  public setPlayer2(player: MinRpsPlayer): void {
    this.player2 = player;
  }

  public setPlayer2Move(move: MinRpsMove): void {
    this.player2.move = move;
  }

  public setPlayer2SelectedMove(move: MinRpsMove): void {
    this.player2.selectedMove = move;
  }
}
