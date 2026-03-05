import { MinRpsMove } from '../../../../core/generated';

export class MinRpsMatchPlayPayload {
  public matchId!: string;
  public playerId!: string;
  public playerMove!: MinRpsMove;
}
