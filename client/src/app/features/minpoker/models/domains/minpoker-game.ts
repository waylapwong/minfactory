export class MinPokerGame {
  public bigBlind: number = 0;
  public createdAt: Date = new Date();
  public id: string = '';
  public maxPlayerCount: number = 0;
  public name: string = '';
  public observerCount: number = 0;
  public playerCount: number = 0;
  public smallBlind: number = 0;

  constructor(init?: Partial<MinPokerGame>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
