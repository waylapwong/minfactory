import { Injectable } from '@nestjs/common';
import { MinPokerConnectedEvent } from '../models/events/minpoker-connected.event';
import { MinPokerDisconnectedEvent } from '../models/events/minpoker-disconnected.event';

@Injectable()
export class MinPokerTournamentService {
  public handleConnection(playerId: string): MinPokerConnectedEvent {
    const event: MinPokerConnectedEvent = new MinPokerConnectedEvent();
    event.playerId = playerId;
    return event;
  }

  public handleDisconnect(playerId: string): MinPokerDisconnectedEvent {
    const event: MinPokerDisconnectedEvent = new MinPokerDisconnectedEvent();
    event.playerId = playerId;
    return event;
  }
}
