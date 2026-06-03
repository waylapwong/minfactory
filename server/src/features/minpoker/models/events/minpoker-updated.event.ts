import { MinPokerGameStatus } from '../enums/minpoker-game-status.enum';

export class MinPokerUpdatedEvent {
  public bigBlind!: number;
  public creatorId!: string;
  public matchId!: string;
  public name!: string;
  public observerIds!: string[];
  public players!: Array<{
    avatar: string;
    id: string;
    name: string;
    seat: number;
    stack: number;
  }>;
  public smallBlind!: number;
  public status!: MinPokerGameStatus;
  public tableSize!: number;
}
