import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { MinPokerDomainMapper } from '../mapper/minpoker-domain.mapper';
import { MinPokerEventMapper } from '../mapper/minpoker-event.mapper';
import { MinPokerMatch } from '../models/domains/minpoker-match';
import { MinPokerMatchJoinCommand } from '../models/commands/minpoker-match-join.command';
import { MinPokerMatchSeatCommand } from '../models/commands/minpoker-match-seat.command';
import { MinPokerMatchCommand } from '../models/enums/minpoker-match-command.enum';
import { MinPokerMatchEvent } from '../models/enums/minpoker-match-event.enum';
import { MinPokerMatchConnectedEvent } from '../models/events/minpoker-match-connected.event';
import { MinPokerMatchUpdatedEvent } from '../models/events/minpoker-match-updated.event';
import { MinPokerGameViewModel } from '../models/viewmodels/minpoker-game.viewmodel';
import { MinPokerSocketRepository } from '../repositories/minpoker-socket.repository';

@Injectable({
  providedIn: 'root',
})
export class MinPokerMultiplayerService {
  public readonly game: Signal<MinPokerGameViewModel> = computed(() =>
    MinPokerDomainMapper.domainToGameViewModel(this.cachedMatch(), this.cachedPlayerId()),
  );
  public readonly playerId: Signal<string> = computed(() => this.cachedPlayerId());

  private readonly cachedMatch: WritableSignal<MinPokerMatch> = signal(new MinPokerMatch());
  private readonly cachedPlayerId: WritableSignal<string> = signal('');

  private isSubscribed: boolean = false;

  constructor(private readonly socketRepository: MinPokerSocketRepository) {}

  public connect(): void {
    this.socketRepository.connect();
    this.subscribeToEvents();
  }

  public disconnect(): void {
    this.unsubscribeFromEvents();
    this.socketRepository.disconnect();
  }

  public setGameId(id: string): void {
    const newMatch: MinPokerMatch = new MinPokerMatch(this.cachedMatch());
    newMatch.id = id;
    this.cachedMatch.set(newMatch);
  }

  public seatGame(playerName: string, avatar: string, seat: number): void {
    const command: MinPokerMatchSeatCommand = new MinPokerMatchSeatCommand();
    command.matchId = this.cachedMatch().id;
    command.playerId = this.cachedPlayerId();
    command.playerName = playerName;
    command.avatar = avatar;
    command.seat = seat;
    this.socketRepository.emit(MinPokerMatchCommand.Seat, command);
    console.warn(`Sending Command: ${MinPokerMatchCommand.Seat}`, command);
  }

  private joinGame(): void {
    const command: MinPokerMatchJoinCommand = new MinPokerMatchJoinCommand();
    command.matchId = this.cachedMatch().id;
    command.playerId = this.cachedPlayerId();
    this.socketRepository.emit(MinPokerMatchCommand.Join, command);
    console.warn(`Sending Command: ${MinPokerMatchCommand.Join}`, command);
  }

  private readonly onMatchConnectedEvent = (event: MinPokerMatchConnectedEvent): void => {
    console.warn('Receiving Event: Connected', event);
    this.cachedPlayerId.set(event.playerId);
    this.joinGame();
  };

  private readonly onMatchUpdatedEvent = (event: MinPokerMatchUpdatedEvent): void => {
    console.warn('Receiving Event: Updated', event);
    this.cachedMatch.set(MinPokerEventMapper.matchUpdatedEventToDomain(event));
  };

  private subscribeToEvents(): void {
    if (this.isSubscribed) {
      return;
    }
    this.socketRepository.on(MinPokerMatchEvent.Connected, this.onMatchConnectedEvent);
    this.socketRepository.on(MinPokerMatchEvent.Updated, this.onMatchUpdatedEvent);
    this.isSubscribed = true;
  }

  private unsubscribeFromEvents(): void {
    if (!this.isSubscribed) {
      return;
    }
    this.socketRepository.off(MinPokerMatchEvent.Connected, this.onMatchConnectedEvent);
    this.socketRepository.off(MinPokerMatchEvent.Updated, this.onMatchUpdatedEvent);
    this.isSubscribed = false;
  }
}
