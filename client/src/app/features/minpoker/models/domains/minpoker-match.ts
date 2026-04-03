import { MinPokerMatchPlayer } from './minpoker-match-player';

export class MinPokerMatch {
  public bigBlind: number = 0;
  public id: string = '';
  public name: string = '';
  public observerIds: string[] = [];
  public players: (MinPokerMatchPlayer | null)[] = [];
  public smallBlind: number = 0;
  public tableSize: number = 0;

  constructor(init?: Partial<MinPokerMatch>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
