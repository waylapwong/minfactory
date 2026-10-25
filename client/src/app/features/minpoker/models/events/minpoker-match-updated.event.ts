import { MinPokerGameStatus } from '../enums/minpoker-game-status.enum';

export interface MinPokerMatchUpdatedPlayerEvent {
  avatar: string;
  id: string;
  name: string;
  seat: number;
  stack: number;
}

export class MinPokerMatchUpdatedEvent {
  declare public bigBlind: number;
  declare public creatorId: string;
  declare public matchId: string;
  declare public name: string;
  declare public observerIds: string[];
  declare public players: MinPokerMatchUpdatedPlayerEvent[];
  declare public smallBlind: number;
  declare public status: MinPokerGameStatus;
  declare public tableSize: number;
}
