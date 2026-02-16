import { MinRpsMove, MinRpsResult } from '../../../../core/generated';

export class MinRpsSingleplayerViewModel {
  public player1Move!: MinRpsMove;
  public player1SelectedMove!: MinRpsMove;
  public player2Move!: MinRpsMove;
  public result!: MinRpsResult;
}
