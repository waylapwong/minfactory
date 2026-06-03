import { MinPokerGameStatus } from '../enums/minpoker-game-status.enum';
import { MinPokerMatchPlayer } from './minpoker-match-player';

export class MinPokerMatch {
  public bigBlind: number = 0;
  public creatorId: string = '';
  public hand: string[] = [];
  public id: string = '';
  public name: string = '';
  public observerIds: string[] = [];
  public players: (MinPokerMatchPlayer | null)[] = [];
  public smallBlind: number = 0;
  public status: MinPokerGameStatus = MinPokerGameStatus.Waiting;
  public tableSize: number = 0;

  constructor(init?: Partial<MinPokerMatch>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
