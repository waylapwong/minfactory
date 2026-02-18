import { MinRpsResult } from '../enums/minrps-game-result.enum';
import { MinRpsMove } from '../enums/minrps-move.enum';

export class MinRpsPlayedPayload {
  public gameId: string;
  public player1Id: string;
  public player1Move: MinRpsMove;
  public player1Result: MinRpsResult;
  public player2Id: string;
  public player2Move: MinRpsMove;
  public player2Result: MinRpsResult;
}
