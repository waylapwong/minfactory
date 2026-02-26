import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { MinRpsMove } from '../../../core/generated';
import { MinRpsDomainMapper } from '../mapper/minrps-domain.mapper';
import { MinRpsPayloadMapper } from '../mapper/minrps-payload.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsMatchCommand } from '../models/enums/minrps-match-command.enum';
import { MinRpsMatchEvent } from '../models/enums/minrps-match-event.enum';
import { MinRpsMatchConnectedPayload } from '../models/payloads/minrps-match-connected.payload';
import { MinRpsMatchJoinPayload } from '../models/payloads/minrps-match-join.payload';
import { MinRpsMatchLeavePayload } from '../models/payloads/minrps-match-leave.payload';
import { MinRpsMatchPlayPayload } from '../models/payloads/minrps-match-play.payload';
import { MinRpsMatchSeatPayload } from '../models/payloads/minrps-match-seat.payload';
import { MinRpsMatchUpdatedPayload } from '../models/payloads/minrps-match-updated.payload';
import { MinRpsMultiplayerViewModel } from '../models/viewmodels/minrps-multiplayer.viewmodel';
import { MinRpsSocketRepository } from '../repositories/minrps-socket.repository';

@Injectable({
  providedIn: 'root',
})
export class MinRpsMultiplayerService {
  public readonly game: Signal<MinRpsMultiplayerViewModel> = computed(() =>
    MinRpsDomainMapper.domainToMultiplayerViewModel(this.cachedGame(), this.cachedPlayerId()),
  );
  public readonly playerId: Signal<string> = computed(() => this.cachedPlayerId());

  private readonly cachedGame: WritableSignal<MinRpsGame> = signal(new MinRpsGame());
  private readonly cachedPlayerId: WritableSignal<string> = signal('');

  private isSubscribed: boolean = false;

  constructor(private readonly socketRepository: MinRpsSocketRepository) {}

  public connect(): void {
    this.socketRepository.connect();
    this.subscribeToEvents();
  }

  public disconnect(): void {
    this.unsubscribeFromEvents();
    this.socketRepository.disconnect();
  }

  public joinGame(): void {
    console.warn('joinGame');
    const command: MinRpsMatchJoinPayload = new MinRpsMatchJoinPayload();
    command.matchId = this.cachedGame().id;
    command.playerId = this.cachedPlayerId();
    this.socketRepository.emit(MinRpsMatchCommand.Join, command);
  }

  public leaveGame(): void {
    const command: MinRpsMatchLeavePayload = new MinRpsMatchLeavePayload();
    this.socketRepository.emit(MinRpsMatchCommand.Leave, command);
  }

  public playGame(): void {
    const command: MinRpsMatchPlayPayload = new MinRpsMatchPlayPayload();
    this.socketRepository.emit(MinRpsMatchCommand.Play, command);
  }

  public seatGame(): void {
    const command: MinRpsMatchSeatPayload = new MinRpsMatchSeatPayload();
    this.socketRepository.emit(MinRpsMatchCommand.Seat, command);
  }

  public selectMove(move: MinRpsMove): void {
    const newGame: MinRpsGame = new MinRpsGame(this.cachedGame());
    if (this.cachedPlayerId() === newGame.player1.id) {
      newGame.player1.selectedMove = move;
    }
    if (this.cachedPlayerId() === newGame.player2.id) {
      newGame.player2.selectedMove = move;
    }
    this.cachedGame.set(newGame);
  }

  public setGameId(id: string): void {
    const newGame: MinRpsGame = new MinRpsGame(this.cachedGame());
    newGame.id = id;
    this.cachedGame.set(newGame);
  }

  private readonly onMatchConnectedEvent = (event: MinRpsMatchConnectedPayload): void => {
    console.warn('onMatchConnectedEvent', event);
    this.cachedPlayerId.set(event.playerId);
    this.joinGame();
  };

  private readonly onMatchUpdatedEvent = (event: MinRpsMatchUpdatedPayload): void => {
    console.warn('onMatchUpdatedEvent', event);
    this.cachedGame.set(MinRpsPayloadMapper.matchUpdatedPayloadToDomain(event));
  };

  private subscribeToEvents(): void {
    if (this.isSubscribed) {
      return;
    }
    this.socketRepository.on(MinRpsMatchEvent.Connected, this.onMatchConnectedEvent);
    this.socketRepository.on(MinRpsMatchEvent.Updated, this.onMatchUpdatedEvent);
    this.isSubscribed = true;
  }

  private unsubscribeFromEvents(): void {
    if (!this.isSubscribed) {
      return;
    }
    this.socketRepository.off(MinRpsMatchEvent.Connected, this.onMatchConnectedEvent);
    this.socketRepository.off(MinRpsMatchEvent.Updated, this.onMatchUpdatedEvent);
    this.isSubscribed = false;
  }
}
