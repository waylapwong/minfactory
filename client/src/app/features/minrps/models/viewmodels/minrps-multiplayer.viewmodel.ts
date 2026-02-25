import { MinRpsMove, MinRpsResult } from '../../../../core/generated';

export class MinRpsMultiplayerViewModel {
  public heroMove!: MinRpsMove;
  public heroName!: string;
  public heroSelectedMove!: MinRpsMove;
  public result!: MinRpsResult;
  public villainMove!: MinRpsMove;
  public villainName!: string;
  public villainSelectedMove!: MinRpsMove;
}
