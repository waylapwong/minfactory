export class MinPokerGameSeatViewModel {
  public avatar: string = '';
  public id: string = '';
  public name: string = '';
  public seat: number = -1;
}

export class MinPokerGameViewModel {
  public bigBlind: number = 0;
  public gameId: string = '';
  public gameName: string = '';
  public isObserver: boolean = true;
  public seats: (MinPokerGameSeatViewModel | null)[] = [];
  public smallBlind: number = 0;
  public tableSize: number = 0;
}
