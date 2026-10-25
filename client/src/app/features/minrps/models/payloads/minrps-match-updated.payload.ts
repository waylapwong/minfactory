import { MinRpsMove, MinRpsResult } from '../../../../core/generated';

export class MinRpsMatchUpdatedPayload {
  declare public matchId: string;
  declare public observers: string[];
  declare public player1HasSelectedMove: boolean;
  declare public player1Id: string;
  declare public player1Move: MinRpsMove;
  declare public player1Name: string;
  declare public player2HasSelectedMove: boolean;
  declare public player2Id: string;
  declare public player2Move: MinRpsMove;
  declare public player2Name: string;
  declare public result: MinRpsResult;
  declare public resultHistory: MinRpsResult[];
}
