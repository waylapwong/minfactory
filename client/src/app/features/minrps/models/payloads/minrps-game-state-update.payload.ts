import { MinRpsMove } from '../../../../core/generated';

export class MinRpsGameStateUpdatePayload {
  public gameId: string = '';
  public player1Id: string = '';
  public player1Name: string = '';
  public player1HasSelectedMove: boolean = false;
  public player1Move: MinRpsMove = MinRpsMove.None;
  public player2Id: string = '';
  public player2Name: string = '';
  public player2HasSelectedMove: boolean = false;
  public player2Move: MinRpsMove = MinRpsMove.None;
}
