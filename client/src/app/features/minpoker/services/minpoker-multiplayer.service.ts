import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { AuthenticationService } from '../../../core/authentication/authentication.service';
import { LoggerService } from '../../../core/logger/logger.service';
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
  private readonly logger: LoggerService = new LoggerService('MinPokerMultiplayerService');

  constructor(
    private readonly socketRepository: MinPokerSocketRepository,
    private readonly authenticationService: AuthenticationService,
  ) {}

  public async connect(): Promise<void> {
    const token: string | null = await this.authenticationService.getIdToken();
    if (!token) {
      throw new Error('Authentication token is not available');
    }
    this.socketRepository.ioSocket.auth = { token };
    this.socketRepository.connect();
    this.subscribeToEvents();
  }

  public disconnect(): void {
    this.unsubscribeFromEvents();
    this.socketRepository.disconnect();
  }

  public leaveGame(): void {
    const command: MinPokerMatchLeaveCommand = new MinPokerMatchLeaveCommand();
    command.matchId = this.cachedMatch().id;
    command.playerId = this.cachedPlayerId();
    this.socketRepository.emit(MinPokerMatchCommand.Leave, command);
    this.logger.debug(`Outgoing Command: ${MinPokerMatchCommand.Leave}`);
  }

  public seatGame(playerName: string, avatar: string, seat: number): void {
    if (!this.cachedMatch().id || !this.cachedPlayerId()) {
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
  }

  public setGameId(id: string): void {
    if (this.cachedMatch().id === id) {
      return;
    }
    const newMatch: MinPokerMatch = new MinPokerMatch();
    newMatch.id = id;
    this.cachedMatch.set(newMatch);
  }

  private joinGame(): void {
    const command: MinPokerMatchJoinCommand = new MinPokerMatchJoinCommand();
    command.matchId = this.cachedMatch().id;
    command.playerId = this.cachedPlayerId();
    this.socketRepository.emit(MinPokerMatchCommand.Join, command);
    this.logger.debug(`Outgoing Command: ${MinPokerMatchCommand.Join}`);
  }

  private readonly onMatchConnectedEvent = (event: MinPokerMatchConnectedEvent): void => {
    this.logger.debug('Incoming Event: Connected');
    this.cachedPlayerId.set(event.playerId);
    this.joinGame();
  };

  private readonly onMatchHandDealtEvent = (event: MinPokerMatchHandDealtEvent): void => {
    this.logger.debug('Incoming Event: HandDealt');
    const newMatch: MinPokerMatch = new MinPokerMatch(this.cachedMatch());
    newMatch.hand = [...event.hand];
    this.cachedMatch.set(newMatch);
  };

  private readonly onMatchUpdatedEvent = (event: MinPokerMatchUpdatedEvent): void => {
    this.logger.debug('Incoming Event: Updated');
    const updatedMatch: MinPokerMatch = MinPokerEventMapper.matchUpdatedEventToDomain(event);
    if (event.matchId === this.cachedMatch().id) {
      updatedMatch.hand = this.cachedMatch().hand;
    }
    this.cachedMatch.set(updatedMatch);
  };

  private subscribeToEvents(): void {
    if (this.isSubscribed) {
      return;
    }
    this.socketRepository.on(MinPokerMatchEvent.Connected, this.onMatchConnectedEvent);
    this.socketRepository.on(MinPokerMatchEvent.HandDealt, this.onMatchHandDealtEvent);
    this.socketRepository.on(MinPokerMatchEvent.Updated, this.onMatchUpdatedEvent);
    this.isSubscribed = true;
  }

  private unsubscribeFromEvents(): void {
    if (!this.isSubscribed) {
      return;
    }
    this.socketRepository.off(MinPokerMatchEvent.Connected, this.onMatchConnectedEvent);
    this.socketRepository.off(MinPokerMatchEvent.HandDealt, this.onMatchHandDealtEvent);
    this.socketRepository.off(MinPokerMatchEvent.Updated, this.onMatchUpdatedEvent);
    this.isSubscribed = false;
  }
}
