export class MinPokerPlayer {
  public id: string = '';
  public name: string = '';

  constructor(init?: Partial<MinPokerPlayer>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
