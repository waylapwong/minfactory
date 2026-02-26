import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsMatchUpdatedPayload } from '../models/payloads/minrps-match-updated.payload';

export class MinRpsPayloadMapper {
  public static matchUpdatedPayloadToDomain(payload: MinRpsMatchUpdatedPayload): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame();

    domain.id = payload.matchId;
    payload.observers.forEach((observerId: string) => {
      domain.observers.set(observerId, new MinRpsPlayer({ id: observerId }));
    });
    domain.observerCount = payload.observers.length;
    domain.setPlayer1(
      new MinRpsPlayer({
        id: payload.player1Id,
        move: payload.player1Move,
        name: payload.player1Name,
      }),
    );
    domain.setPlayer2(
      new MinRpsPlayer({
        id: payload.player2Id,
        move: payload.player2Move,
        name: payload.player2Name,
      }),
    );
    domain.result = payload.result;

    return domain;
  }
}
