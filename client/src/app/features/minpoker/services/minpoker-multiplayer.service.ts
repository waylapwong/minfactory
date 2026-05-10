import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { AuthenticationService } from '../../../core/authentication/services/authentication.service';
import { LoggerService } from '../../../core/logging/services/logger.service';
import { MinPokerDomainMapper } from '../mapper/minpoker-domain.mapper';
import { MinPokerEventMapper } from '../mapper/minpoker-event.mapper';
import { MinPokerMatchJoinCommand } from '../models/commands/minpoker-match-join.command';
import { MinPokerMatchLeaveCommand } from '../models/commands/minpoker-match-leave.command';
import { MinPokerMatchSeatCommand } from '../models/commands/minpoker-match-seat.command';
import { MinPokerMatch } from '../models/domains/minpoker-match';
import { MinPokerMatchCommand } from '../models/enums/minpoker-match-command.enum';
import { MinPokerMatchEvent } from '../models/enums/minpoker-match-event.enum';
import { MinPokerMatchConnectedEvent } from '../models/events/minpoker-match-connected.event';
import { MinPokerMatchHandDealtEvent } from '../models/events/minpoker-match-hand-dealt.event';
import { MinPokerMatchUpdatedEvent } from '../models/events/minpoker-match-updated.event';
import { MinPokerGameVm } from '../models/viewmodels/minpoker-game.vm';
import { MinPokerSocketRepository } from '../repositories/minpoker-socket.repository';

@Injectable({
  providedIn: 'root',
})
export class MinPokerMultiplayerService {
  public readonly game: Signal<MinPokerGameVm> = computed(() =>
    MinPokerDomainMapper.domainToGameViewModel(this.cachedMatch(), this.cachedPlayerId()),
  );
  public readonly playerId: Signal<string> = computed(() => this.cachedPlayerId());

  private readonly cachedMatch: WritableSignal<MinPokerMatch> = signal(new MinPokerMatch());
  private readonly cachedPlayerId: WritableSignal<string> = signal('');

  private isSubscribed: boolean = false;
  private readonly logger: LoggerService = new LoggerService('MinPokerMultiplayerService');

  constructor(
    private readonly socketRepository: MinPokerSocketRepository,
    private readonly authenticationService: AuthenticationService,
  ) {}

  public async connect(): Promise<void> {
    this.logger.debug(`START connect()`);
    try {
      const token: string | null = await this.authenticationService.getIdToken();
      if (!token) {
        throw new Error('Authentication token is not available');
      }
      this.socketRepository.ioSocket.auth = { token };
      this.socketRepository.connect();
      this.subscribeToEvents();
    } finally {
      this.logger.debug(`END connect(...)`);
    }
  }

  public disconnect(): void {
    this.logger.debug(`START disconnect()`);
    this.unsubscribeFromEvents();
    this.socketRepository.disconnect();
    this.logger.debug(`END disconnect(...)`);
  }

  public leaveGame(): void {
    this.logger.debug(`START leaveGame()`);
    const command: MinPokerMatchLeaveCommand = new MinPokerMatchLeaveCommand();
    command.matchId = this.cachedMatch().id;
    command.playerId = this.cachedPlayerId();
    this.socketRepository.emit(MinPokerMatchCommand.Leave, command);
    this.logger.debug(`Outgoing Command: ${MinPokerMatchCommand.Leave}`);
    this.logger.debug(`END leaveGame(...)`);
  }

  public seatGame(playerName: string, avatar: string, seat: number): void {
    this.logger.debug(`START seatGame(playerName: ${playerName}, avatar: ${avatar}, seat: ${seat})`);
    if (!this.cachedMatch().id || !this.cachedPlayerId()) {
      this.logger.debug(`END seatGame(...)`);
      return;
    }

    const command: MinPokerMatchSeatCommand = new MinPokerMatchSeatCommand();
    command.matchId = this.cachedMatch().id;
    command.playerId = this.cachedPlayerId();
    command.playerName = playerName;
    command.avatar = avatar;
    command.seat = seat;
    this.socketRepository.emit(MinPokerMatchCommand.Seat, command);
    this.logger.debug(`Outgoing Command: ${MinPokerMatchCommand.Seat}`);
    this.logger.debug(`END seatGame(...)`);
  }

  public setGameId(id: string): void {
    this.logger.debug(`START setGameId(id: ${id})`);
    if (this.cachedMatch().id === id) {
      this.logger.debug(`END setGameId(...)`);
      return;
    }
    const newMatch: MinPokerMatch = new MinPokerMatch();
    newMatch.id = id;
    this.cachedMatch.set(newMatch);
    this.logger.debug(`END setGameId(...)`);
  }

  private joinGame(): void {
    this.logger.debug(`START joinGame()`);
    const command: MinPokerMatchJoinCommand = new MinPokerMatchJoinCommand();
    command.matchId = this.cachedMatch().id;
    command.playerId = this.cachedPlayerId();
    this.socketRepository.emit(MinPokerMatchCommand.Join, command);
    this.logger.debug(`Outgoing Command: ${MinPokerMatchCommand.Join}`);
    this.logger.debug(`END joinGame(...)`);
  }

  private readonly onMatchConnectedEvent = (event: MinPokerMatchConnectedEvent): void => {
    this.logger.debug(`START onMatchConnectedEvent(event: ${JSON.stringify(event)})`);
    this.logger.debug('Incoming Event: Connected');
    this.cachedPlayerId.set(event.playerId);
    this.joinGame();
    this.logger.debug(`END onMatchConnectedEvent(...)`);
  };

  private readonly onMatchHandDealtEvent = (event: MinPokerMatchHandDealtEvent): void => {
    this.logger.debug(`START onMatchHandDealtEvent(event: ${JSON.stringify(event)})`);
    this.logger.debug('Incoming Event: HandDealt');
    const newMatch: MinPokerMatch = new MinPokerMatch(this.cachedMatch());
    newMatch.hand = [...event.hand];
    this.cachedMatch.set(newMatch);
    this.logger.debug(`END onMatchHandDealtEvent(...)`);
  };

  private readonly onMatchUpdatedEvent = (event: MinPokerMatchUpdatedEvent): void => {
    this.logger.debug(`START onMatchUpdatedEvent(event: ${JSON.stringify(event)})`);
    this.logger.debug('Incoming Event: Updated');
    const updatedMatch: MinPokerMatch = MinPokerEventMapper.toDomain(event);
    if (event.matchId === this.cachedMatch().id) {
      updatedMatch.hand = this.cachedMatch().hand;
    }
    this.cachedMatch.set(updatedMatch);
    this.logger.debug(`END onMatchUpdatedEvent(...)`);
  };

  private subscribeToEvents(): void {
    this.logger.debug(`START subscribeToEvents()`);
    if (this.isSubscribed) {
      this.logger.debug(`END subscribeToEvents(...)`);
      return;
    }
    this.socketRepository.on(MinPokerMatchEvent.Connected, this.onMatchConnectedEvent);
    this.socketRepository.on(MinPokerMatchEvent.HandDealt, this.onMatchHandDealtEvent);
    this.socketRepository.on(MinPokerMatchEvent.Updated, this.onMatchUpdatedEvent);
    this.isSubscribed = true;
    this.logger.debug(`END subscribeToEvents(...)`);
  }

  private unsubscribeFromEvents(): void {
    this.logger.debug(`START unsubscribeFromEvents()`);
    if (!this.isSubscribed) {
      this.logger.debug(`END unsubscribeFromEvents(...)`);
      return;
    }
    this.socketRepository.off(MinPokerMatchEvent.Connected, this.onMatchConnectedEvent);
    this.socketRepository.off(MinPokerMatchEvent.HandDealt, this.onMatchHandDealtEvent);
    this.socketRepository.off(MinPokerMatchEvent.Updated, this.onMatchUpdatedEvent);
    this.isSubscribed = false;
    this.logger.debug(`END unsubscribeFromEvents(...)`);
  }
}
