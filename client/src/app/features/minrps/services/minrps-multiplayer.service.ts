import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
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
  public readonly match: Signal<MinRpsMultiplayerViewModel> = computed(() =>
    MinRpsDomainMapper.domainToMultiplayerViewModel(this.cachedMatch(), this.isPlayer2()),
  );
  public readonly playerId: Signal<string> = computed(() => this.cachedPlayerId());

  private readonly cachedMatch: WritableSignal<MinRpsGame> = signal(new MinRpsGame());
  private readonly cachedPlayerId: WritableSignal<string> = signal('');
  private readonly isPlayer2: Signal<boolean> = computed(() => {
    return this.cachedMatch().player2.id === this.cachedPlayerId();
  });

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

  public sendJoinCommand(command: MinRpsMatchJoinPayload): void {
    this.socketRepository.emit(MinRpsMatchCommand.Join, command);
  }

  public sendLeaveCommand(command: MinRpsMatchLeavePayload): void {
    this.socketRepository.emit(MinRpsMatchCommand.Leave, command);
  }

  public sendPlayCommand(command: MinRpsMatchPlayPayload): void {
    this.socketRepository.emit(MinRpsMatchCommand.Play, command);
  }

  public sendSeatCommand(command: MinRpsMatchSeatPayload): void {
    this.socketRepository.emit(MinRpsMatchCommand.Seat, command);
  }

  private readonly onMatchConnectedEvent = (event: MinRpsMatchConnectedPayload): void => {
    this.cachedPlayerId.set(event.playerId);
  };

  private readonly onMatchUpdatedEvent = (event: MinRpsMatchUpdatedPayload): void => {
    this.cachedMatch.set(MinRpsPayloadMapper.matchUpdatedPayloadToDomain(event));
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
