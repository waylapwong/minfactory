import { Component, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { RoutingService } from '../../../../core/services/routing.service';
import { MinRpsEvent } from '../../models/enums/minrps-event.enum';
import { MinRpsConnectedPayload } from '../../models/payloads/minrps-connected.payload';
import { MinRpsDisconnectedPayload } from '../../models/payloads/minrps-disconnected.payload';
import { MinRpsJoinPayload } from '../../models/payloads/minrps-join.payload';
import { MinRpsJoinedPayload } from '../../models/payloads/minrps-joined.payload';
import { MinRpsLeavePayload } from '../../models/payloads/minrps-leave.payload';
import { MinRpsLeftPayload } from '../../models/payloads/minrps-left.payload';
import { MinRpsGameService } from '../../services/minrps-game.service';
import { MinRpsSocketService } from '../../services/minrps-socket.service';

@Component({
  selector: 'app-minrps-multiplayer',
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
    this.sendEvent(MinRpsEvent.Leave, leaveEvent);
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
    const gameExists: boolean = await this.gameService.checkGameById(id);
    if (!gameExists) {
      this.routingService.navigateToMinRpsLobby();
    }
  }

  private sendEvent(event: MinRpsEvent, data: any): void {
    this.socketService.emit(event, data);
    console.log(`${event} event sent`, data);
  }

  private setGameId(): void {
    const gameId = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.gameId.set(gameId);
  }

  private subscribeToConnectedEvent(): void {
    this.subscription.add(
      this.socketService
        .fromEvent(MinRpsEvent.Connected)
        .subscribe((connectedEvent: MinRpsConnectedPayload) => {
          console.log(`${MinRpsEvent.Connected} event received`, connectedEvent);
          this.playerId.set(connectedEvent.playerId);
          const joinPayload: MinRpsJoinPayload = {
            gameId: this.gameId(),
            playerId: this.playerId(),
          };
          this.sendEvent(MinRpsEvent.Join, joinPayload);
        }),
    );
  }

  private subscribeToDisonnectedEvent(): void {
    this.subscription.add(
      this.socketService
        .fromEvent(MinRpsEvent.Disconnected)
        .subscribe((disconnectedEvent: MinRpsDisconnectedPayload) => {
          console.log(`${MinRpsEvent.Connected} event received`, disconnectedEvent);
        }),
    );
  }

  private subscribeToJoinedEvent(): void {
    this.subscription.add(
      this.socketService
        .fromEvent(MinRpsEvent.Joined)
        .subscribe((joinedEvent: MinRpsJoinedPayload) => {
          console.log(`${MinRpsEvent.Joined} event received`, joinedEvent);
        }),
    );
  }

  private subscribeToLeftEvent(): void {
    this.subscription.add(
      this.socketService.fromEvent(MinRpsEvent.Left).subscribe((leftEvent: MinRpsLeftPayload) => {
        console.log(`${MinRpsEvent.Left} event received`, leftEvent);
      }),
    );
  }
}
