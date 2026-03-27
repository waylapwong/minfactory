import { MinPokerMatch } from '../models/domains/minpoker-match';
import { MinPokerMatchPlayer } from '../models/domains/minpoker-match-player';
import {
  MinPokerMatchUpdatedEvent,
  MinPokerMatchUpdatedPlayerEvent,
} from '../models/events/minpoker-match-updated.event';

export class MinPokerEventMapper {
  public static matchUpdatedEventToDomain(event: MinPokerMatchUpdatedEvent): MinPokerMatch {
    const domain: MinPokerMatch = new MinPokerMatch();

    domain.bigBlind = event.bigBlind;
    domain.id = event.matchId;
    domain.name = event.name;
    domain.observerIds = [...event.observerIds];
    domain.smallBlind = event.smallBlind;
    domain.tableSize = event.tableSize;

    domain.players = new Array(event.tableSize).fill(null);
    event.players.forEach((player: MinPokerMatchUpdatedPlayerEvent) => {
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
