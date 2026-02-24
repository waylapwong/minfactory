import { MinRpsMove } from '../enums/minrps-move.enum';

export class MinRpsMatchPlayPayload {
  public matchId: string;
  public playerId: string;
  public playerMove: MinRpsMove;
}
