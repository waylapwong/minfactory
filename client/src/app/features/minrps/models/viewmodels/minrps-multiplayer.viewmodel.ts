import { MinRpsMove, MinRpsResult } from '../../../../core/generated';

export class MinRpsMultiplayerViewModel {
  public canTakeHeroSeat!: boolean;
  public canTakeVillainSeat!: boolean;
  public gameId!: string;
  public heroHasSelectedMove!: boolean;
  public heroIsWinning!: boolean;
  public heroMove!: MinRpsMove;
  public heroName!: string;
  public isObserver!: boolean;
  public result!: MinRpsResult;
  public villainHasSelectedMove!: boolean;
  public villainIsWinning!: boolean;
  public villainMove!: MinRpsMove;
  public villainName!: string;
}
