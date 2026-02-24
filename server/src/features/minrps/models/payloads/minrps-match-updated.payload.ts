import { MinRpsResult } from '../enums/minrps-game-result.enum';
import { MinRpsMove } from '../enums/minrps-move.enum';

export class MinRpsMatchUpdatedPayload {
  public matchId: string;
  public observers: string[];
  public player1Id: string;
  public player1Move: MinRpsMove;
  public player1Name: string;
  public player2Id: string;
  public player2Move: MinRpsMove;
  public player2Name: string;
  public result: MinRpsResult;
}
