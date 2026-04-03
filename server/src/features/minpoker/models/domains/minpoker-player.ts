export class MinPokerPlayer {
  public avatar: string = '';
  public hand: string[] = [];
  public id: string = '';
  public name: string = '';
  public seat: number = -1;
  public stack: number = 200;

  constructor(init?: Partial<MinPokerPlayer>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
