import { MinRpsResult } from '../../../../core/generated';
import { MinRpsPlayer } from './minrps-player';

export class MinRpsGame {
  public createdAt: Date = new Date();
  public id: string = '';
  public name: string = '';
  public observers: Map<string, MinRpsPlayer> = new Map<string, MinRpsPlayer>();
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
}
