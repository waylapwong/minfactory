import { Component, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoutingService } from '../../../../core/services/routing.service';
import { MinRpsGameEvent } from '../../models/enums/minrps-game-event.enum';
import { MinRpsConnectedPayload } from '../../models/payloads/minrps-connected.payload';
import { MinRpsDisconnectedPayload } from '../../models/payloads/minrps-disconnected.payload';
import { MinRpsJoinPayload } from '../../models/payloads/minrps-join.payload';
import { MinRpsJoinedPayload } from '../../models/payloads/minrps-joined.payload';
import { MinRpsLeavePayload } from '../../models/payloads/minrps-leave.payload';
import { MinRpsLeftPayload } from '../../models/payloads/minrps-left.payload';
import { MinRpsGameService } from '../../services/minrps-game.service';
import { MinRpsMultiplayerService } from '../../services/minrps-multiplayer.service';

@Component({
  selector: 'minrps-multiplayer',
  templateUrl: './minrps-multiplayer.component.html',
  styleUrls: ['./minrps-multiplayer.component.scss'],
})
export class MinRpsMultiplayerComponent implements OnInit, OnDestroy {
  public readonly playerId: WritableSignal<string> = signal('');

  private readonly gameId: WritableSignal<string> = signal('');

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly gameService: MinRpsGameService,
    private readonly multiplayerService: MinRpsMultiplayerService,
    private readonly routingService: RoutingService,
  ) {}

  public ngOnInit() {
    this.setGameId();
    this.checkGameExists(this.gameId());
    this.multiplayerService.connect();
    this.subscribeToEvents();
  }

  public ngOnDestroy(): void {
    const leavePayload: MinRpsLeavePayload = { gameId: this.gameId(), playerId: this.playerId() };
    this.multiplayerService.sendLeaveEvent(leavePayload);
    this.unsubscribeFromEvents();
    this.multiplayerService.disconnect();
  }

  private async checkGameExists(id: string): Promise<void> {
    const gameExists: boolean = await this.gameService.gameExistByID(id);
    if (!gameExists) {
      this.routingService.navigateToMinRpsLobby();
    }
  }

  private readonly onConnected = (payload: MinRpsConnectedPayload): void => {
    console.log(`${MinRpsGameEvent.Connected} event received`, payload);
    this.playerId.set(payload.playerId);

    const joinPayload: MinRpsJoinPayload = new MinRpsJoinPayload();
    joinPayload.gameId = this.gameId();
    joinPayload.playerId = this.playerId();

    this.multiplayerService.sendJoinEvent(joinPayload);
  };

  private readonly onDisconnected = (payload: MinRpsDisconnectedPayload): void => {
    console.log(`${MinRpsGameEvent.Disconnected} event received`, payload);
  };

  private readonly onJoined = (payload: MinRpsJoinedPayload): void => {
    console.log(`${MinRpsGameEvent.Joined} event received`, payload);
  };

  private readonly onLeft = (payload: MinRpsLeftPayload): void => {
    console.log(`${MinRpsGameEvent.Left} event received`, payload);
  };

  private setGameId(): void {
    const gameId: string = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.gameId.set(gameId);
  }

  private subscribeToEvents(): void {
    this.multiplayerService.onEvent(MinRpsGameEvent.Connected, this.onConnected);
    this.multiplayerService.onEvent(MinRpsGameEvent.Joined, this.onJoined);
    this.multiplayerService.onEvent(MinRpsGameEvent.Left, this.onLeft);
    this.multiplayerService.onEvent(MinRpsGameEvent.Disconnected, this.onDisconnected);
  }

  private unsubscribeFromEvents(): void {
    this.multiplayerService.offEvent(MinRpsGameEvent.Connected, this.onConnected);
    this.multiplayerService.offEvent(MinRpsGameEvent.Joined, this.onJoined);
    this.multiplayerService.offEvent(MinRpsGameEvent.Left, this.onLeft);
    this.multiplayerService.offEvent(MinRpsGameEvent.Disconnected, this.onDisconnected);
  }
}
