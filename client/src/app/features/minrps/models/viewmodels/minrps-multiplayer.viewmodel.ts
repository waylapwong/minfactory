import { MinRpsMove, MinRpsResult } from '../../../../core/generated';

export class MinRpsMultiplayerViewModel {
  declare public canTakeHeroSeat: boolean;
  declare public canTakeVillainSeat: boolean;
  declare public gameId: string;
  declare public heroHasSelectedMove: boolean;
  declare public heroIsWinning: boolean;
  declare public heroMove: MinRpsMove;
  declare public heroName: string;
  declare public isObserver: boolean;
  declare public result: MinRpsResult;
  public resultHistory: MinRpsResult[] = [];
  declare public villainHasSelectedMove: boolean;
  declare public villainIsWinning: boolean;
  declare public villainMove: MinRpsMove;
  declare public villainName: string;
}
