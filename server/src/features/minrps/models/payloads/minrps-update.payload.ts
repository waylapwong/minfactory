import { MinRpsMove } from '../enums/minrps-move.enum';

export class MinRpsMatchUpdatePayload {
  public matchId: string;
  public playerId: string;
  public playerMove: MinRpsMove;
  public playerName: string;
}
