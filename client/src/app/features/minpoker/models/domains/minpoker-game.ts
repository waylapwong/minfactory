export class MinPokerGame {
  public bigBlind: number = 0;
  public createdAt: Date = new Date(0);
  public id: string = '';
  public name: string = '';
  public observerCount: number = 0;
  public playerCount: number = 0;
  public smallBlind: number = 0;
  public tableSize: number = 0;

  constructor(init?: Partial<MinPokerGame>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
