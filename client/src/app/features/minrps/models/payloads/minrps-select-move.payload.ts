import { MinRpsMove } from '../../../../core/generated';

export class MinRpsSelectMovePayload {
  public gameId: string = '';
  public playerId: string = '';
  public move: MinRpsMove = MinRpsMove.None;
}
