import { MinPokerMatch } from '../models/domains/minpoker-match';
import { MinPokerMatchPlayer } from '../models/domains/minpoker-match-player';
import {
  MinPokerMatchUpdatedPayload,
  MinPokerMatchUpdatedPlayerPayload,
} from '../models/payloads/minpoker-match-updated.payload';

export class MinPokerPayloadMapper {
  public static matchUpdatedPayloadToDomain(payload: MinPokerMatchUpdatedPayload): MinPokerMatch {
    const domain: MinPokerMatch = new MinPokerMatch();

    domain.bigBlind = payload.bigBlind;
    domain.id = payload.matchId;
    domain.name = payload.name;
    domain.observerIds = [...payload.observerIds];
    domain.smallBlind = payload.smallBlind;
    domain.tableSize = payload.tableSize;

    domain.players = new Array<MinPokerMatchPlayer | null>(payload.tableSize).fill(null);
    payload.players.forEach((player: MinPokerMatchUpdatedPlayerPayload) => {
      domain.players[player.seat] = new MinPokerMatchPlayer({
        avatar: player.avatar,
        id: player.id,
        name: player.name,
        seat: player.seat,
      });
    });

    return domain;
  }
}
