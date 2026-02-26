import { MinRpsMove, MinRpsResult } from '../../../../core/generated';

export class MinRpsMultiplayerViewModel {
  public canTakeHeroSeat!: boolean;
  public canTakeVillainSeat!: boolean;
  public gameId!: string;
  public heroMove!: MinRpsMove;
  public heroName!: string;
  public heroSelectedMove!: MinRpsMove;
  public isObserver!: boolean;
  public result!: MinRpsResult;
  public villainMove!: MinRpsMove;
  public villainName!: string;
  public villainSelectedMove!: MinRpsMove;
}
