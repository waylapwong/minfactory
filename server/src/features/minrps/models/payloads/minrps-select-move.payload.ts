import { MinRpsMove } from '../enums/minrps-move.enum';

export class MinRpsSelectMovePayload {
  public gameId: string;
  public playerId: string;
  public move: MinRpsMove;
}
