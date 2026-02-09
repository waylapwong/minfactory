import { MinRpsResult } from '../enums/minrps-game-result.enum';
import { MinRpsMove } from '../enums/minrps-move.enum';

export class MinRpsMatch {
  public opponentMove: MinRpsMove;
  public playerMove: MinRpsMove;
  public winner: MinRpsResult;
}
