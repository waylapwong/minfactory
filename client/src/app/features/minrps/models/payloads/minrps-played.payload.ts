import { MinRpsMove, MinRpsResult } from '../../../../core/generated';

export class MinRpsPlayedPayload {
  public gameId: string = '';
  public player1Id: string = '';
  public player1Move: MinRpsMove = MinRpsMove.None;
  public player1Result: MinRpsResult = MinRpsResult.None;
  public player2Id: string = '';
  public player2Move: MinRpsMove = MinRpsMove.None;
  public player2Result: MinRpsResult = MinRpsResult.None;
}
