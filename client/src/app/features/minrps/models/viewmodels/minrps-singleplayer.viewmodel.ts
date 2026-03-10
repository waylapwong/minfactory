import { MinRpsMove, MinRpsResult } from '../../../../core/generated';

export class MinRpsSingleplayerViewModel {
  public player1IsWinning!: boolean;
  public player1Move!: MinRpsMove;
  public player2IsWinning!: boolean;
  public player2Move!: MinRpsMove;
  public result!: MinRpsResult;
}
