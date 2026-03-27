export interface MinPokerMatchUpdatedPlayerPayload {
  avatar: string;
  id: string;
  name: string;
  seat: number;
}

export class MinPokerMatchUpdatedPayload {
  public bigBlind!: number;
  public matchId!: string;
  public name!: string;
  public observerIds!: string[];
  public players!: MinPokerMatchUpdatedPlayerPayload[];
  public smallBlind!: number;
  public tableSize!: number;
}
