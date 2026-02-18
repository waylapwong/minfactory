import { MinRpsMove } from '../enums/minrps-move.enum';

export class MinRpsMoveSelectedPayload {
  public gameId: string;
  public playerId: string;
  public move: MinRpsMove;
}
