export class MinPokerMatchPlayer {
  public avatar: string = '';
  public id: string = '';
  public name: string = '';
  public seat: number = -1;
  public stack: number = 0;

  constructor(init?: Partial<MinPokerMatchPlayer>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
