import { MinRpsMove } from '../../../../core/generated';

export class MinRpsMoveSelectedPayload {
  public gameId: string = '';
  public playerId: string = '';
  public move: MinRpsMove = MinRpsMove.None;
}
