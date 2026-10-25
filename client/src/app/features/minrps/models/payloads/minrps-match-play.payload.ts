import { MinRpsMove } from '../../../../core/generated';

export class MinRpsMatchPlayPayload {
  declare public matchId: string;
  declare public playerId: string;
  declare public playerMove: MinRpsMove;
}
