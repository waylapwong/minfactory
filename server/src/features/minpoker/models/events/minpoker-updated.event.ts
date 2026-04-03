export class MinPokerUpdatedEvent {
  public bigBlind: number;
  public matchId: string;
  public name: string;
  public observerIds: string[];
  public players: Array<{
    avatar: string;
    id: string;
    name: string;
    seat: number;
    stack: number;
  }>;
  public smallBlind: number;
  public tableSize: number;
}
