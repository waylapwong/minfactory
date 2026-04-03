export class MinPokerPlayer {
  public avatar: string = '';
  public id: string = '';
  public name: string = '';
  public seat: number = -1;

  constructor(init?: Partial<MinPokerPlayer>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
