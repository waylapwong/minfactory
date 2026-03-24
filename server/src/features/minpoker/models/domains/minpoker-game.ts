import { MinPokerPlayer } from './minpoker-player';

export class MinPokerGame {
  public bigBlind: number = 2;
  public createdAt: Date = new Date(0);
  public id: string = '';
  public name: string = '';
  public players: MinPokerPlayer[] = [];
  public private;
  public smallBlind: number = 1;
  public tableSize: number = 6;

  constructor(init?: Partial<MinPokerGame>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
