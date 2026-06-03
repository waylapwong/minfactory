import { MinPokerGameStatus } from '../enums/minpoker-game-status.enum';

export interface MinPokerMatchUpdatedPlayerEvent {
  avatar: string;
  id: string;
  name: string;
  seat: number;
  stack: number;
}

export class MinPokerMatchUpdatedEvent {
  public bigBlind!: number;
  public creatorId!: string;
  public matchId!: string;
  public name!: string;
  public observerIds!: string[];
  public players!: MinPokerMatchUpdatedPlayerEvent[];
  public smallBlind!: number;
  public status!: MinPokerGameStatus;
  public tableSize!: number;
}
