import { MinRpsMove, MinRpsResult } from '../../../../core/generated';

export class MinRpsSingleplayerViewModel {
  declare public player1IsWinning: boolean;
  declare public player1Move: MinRpsMove;
  declare public player2IsWinning: boolean;
  declare public player2Move: MinRpsMove;
  public resultHistory: MinRpsResult[] = [];
  declare public result: MinRpsResult;
}
