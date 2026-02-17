import { MinRpsMove, MinRpsResult } from '../../../../core/generated';

export class MinRpsMultiplayerViewModel {
  public gameId: string = '';
  public playerId: string = '';
  public player1Id: string = '';
  public player1Name: string = '';
  public player2Id: string = '';
  public player2Name: string = '';
  public opponentId: string = '';
  public playerMove: MinRpsMove = MinRpsMove.None;
  public player1Move: MinRpsMove = MinRpsMove.None;
  public player2Move: MinRpsMove = MinRpsMove.None;
  public playerSelectedMove: MinRpsMove = MinRpsMove.None;
  public playerHasSelectedMove: boolean = false;
  public player1HasSelectedMove: boolean = false;
  public player2HasSelectedMove: boolean = false;
  public opponentMove: MinRpsMove = MinRpsMove.None;
  public opponentHasSelectedMove: boolean = false;
  public result: MinRpsResult = MinRpsResult.None;
  public player1Result: MinRpsResult = MinRpsResult.None;
  public player2Result: MinRpsResult = MinRpsResult.None;
  public isPlayer1: boolean = false;
  public isPlayer2: boolean = false;
}
