import { MinRpsMove, MinRpsResult } from '../../../../core/generated';

export class MinRpsMatchUpdatedPayload {
  public matchId!: string;
  public observers!: string[];
  public player1HasSelectedMove!: boolean;
  public player1Id!: string;
  public player1Move!: MinRpsMove;
  public player1Name!: string;
  public player2HasSelectedMove!: boolean;
  public player2Id!: string;
  public player2Move!: MinRpsMove;
  public player2Name!: string;
  public result!: MinRpsResult;
}
