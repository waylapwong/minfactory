import { Component, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { RoutingService } from '../../../../core/services/routing.service';
import { MinRpsGameEvent } from '../../models/enums/minrps-game-event.enum';
import { MinRpsConnectedPayload } from '../../models/payloads/minrps-connected.payload';
import { MinRpsDisconnectedPayload } from '../../models/payloads/minrps-disconnected.payload';
import { MinRpsJoinPayload } from '../../models/payloads/minrps-join.payload';
import { MinRpsJoinedPayload } from '../../models/payloads/minrps-joined.payload';
import { MinRpsLeavePayload } from '../../models/payloads/minrps-leave.payload';
import { MinRpsLeftPayload } from '../../models/payloads/minrps-left.payload';
import { MinRpsGameService } from '../../services/minrps-game.service';
import { MinRpsSocketService } from '../../services/minrps-socket.service';

@Component({
  selector: 'minrps-multiplayer',
  templateUrl: './minrps-multiplayer.component.html',
  styleUrls: ['./minrps-multiplayer.component.scss'],
})
export class MinRpsMultiplayerComponent implements OnInit, OnDestroy {
  public readonly playerId: WritableSignal<string> = signal('');

  private readonly gameId: WritableSignal<string> = signal('');
  private readonly subscription: Subscription = new Subscription();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly gameService: MinRpsGameService,
    private readonly routingService: RoutingService,
    private readonly socketService: MinRpsSocketService,
  ) {}

  public ngOnInit() {
    this.setGameId();
    this.socketService.connect();
    this.subscribeToEvents();
    this.checkGameExists(this.gameId());
  }

  public ngOnDestroy(): void {
    const leaveEvent: MinRpsLeavePayload = { gameId: this.gameId(), playerId: this.playerId() };
    this.sendEvent(MinRpsGameEvent.Leave, leaveEvent);
    this.subscription.unsubscribe();
    this.socketService.disconnect();
  }

  protected subscribeToEvents(): void {
    this.subscribeToConnectedEvent();
    this.subscribeToJoinedEvent();
    this.subscribeToLeftEvent();
    this.subscribeToDisonnectedEvent();
  }

  private async checkGameExists(id: string): Promise<void> {
    const gameExists: boolean = await this.gameService.gameExistByID(id);
    if (!gameExists) {
      this.routingService.navigateToMinRpsLobby();
    }
  }

  private sendEvent(event: MinRpsGameEvent, payload: any): void {
    this.socketService.emit(event, payload);
    console.log(`${event} event sent`, payload);
  }

  private setGameId(): void {
    const gameId: string = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.gameId.set(gameId);
  }

  private subscribeToConnectedEvent(): void {
    this.subscription.add(
      this.socketService
        .fromEvent(MinRpsGameEvent.Connected)
        .subscribe((payload: MinRpsConnectedPayload) => {
          console.log(`${MinRpsGameEvent.Connected} event received`, payload);
          this.playerId.set(payload.playerId);
          const joinPayload: MinRpsJoinPayload = {
            gameId: this.gameId(),
            playerId: this.playerId(),
          };
          this.sendEvent(MinRpsGameEvent.Join, joinPayload);
        }),
    );
  }

  private subscribeToDisonnectedEvent(): void {
    this.subscription.add(
      this.socketService
        .fromEvent(MinRpsGameEvent.Disconnected)
        .subscribe((payload: MinRpsDisconnectedPayload) => {
          console.log(`${MinRpsGameEvent.Connected} event received`, payload);
        }),
    );
  }

  private subscribeToJoinedEvent(): void {
    this.subscription.add(
      this.socketService
        .fromEvent(MinRpsGameEvent.Joined)
        .subscribe((payload: MinRpsJoinedPayload) => {
          console.log(`${MinRpsGameEvent.Joined} event received`, payload);
        }),
    );
  }

  private subscribeToLeftEvent(): void {
    this.subscription.add(
      this.socketService.fromEvent(MinRpsGameEvent.Left).subscribe((payload: MinRpsLeftPayload) => {
        console.log(`${MinRpsGameEvent.Left} event received`, payload);
      }),
    );
  }
}
