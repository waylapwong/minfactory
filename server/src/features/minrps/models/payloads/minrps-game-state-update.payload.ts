import { MinRpsMove } from '../enums/minrps-move.enum';

export class MinRpsGameStateUpdatePayload {
  public gameId: string;
  public player1Id: string;
  public player1Name: string;
  public player1HasSelectedMove: boolean;
  public player1Move: MinRpsMove;
  public player2Id: string;
  public player2Name: string;
  public player2HasSelectedMove: boolean;
  public player2Move: MinRpsMove;
}
