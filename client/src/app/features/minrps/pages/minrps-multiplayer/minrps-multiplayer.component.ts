import { Component, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { RoutingService } from '../../../../core/services/routing.service';
import { MinRpsEvent } from '../../models/enums/minrps-event.enum';
import { MinRpsConnectedEvent } from '../../models/events/minrps-connected.event';
import { MinRpsJoinEvent } from '../../models/events/minrps-join.event';
import { MinRpsJoinedEvent } from '../../models/events/minrps-joined.event';
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
    this.socketService.connect();
    this.subscribeToAllEvents();
    this.setGameId();
    this.checkGameExists(this.gameId());
  }

  public ngOnDestroy(): void {
    this.unsubscribeFromEvents();
    this.socketService.disconnect();
  }

  protected subscribeToAllEvents(): void {
    this.subscribeToConnectedEvent();
    this.subscribeToJoinedEvent();
  }

  private async checkGameExists(id: string): Promise<void> {
    const gameExists: boolean = await this.gameService.checkGameById(id);
    if (!gameExists) {
      this.routingService.navigateToMinRpsLobby();
    }
  }

  private sendJoinEvent(): void {
    const joinEvent: MinRpsJoinEvent = { matchId: this.gameId(), playerId: this.playerId() };
    console.log(`${MinRpsEvent.Join} event sent`, joinEvent);
    this.socketService.emit(MinRpsEvent.Join, joinEvent);
  }

  private setGameId(): void {
    const gameId = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.gameId.set(gameId);
  }

  private subscribeToConnectedEvent(): void {
    this.subscription.add(
      this.socketService
        .fromEvent(MinRpsEvent.Connected)
        .subscribe((connectedEvent: MinRpsConnectedEvent) => {
          console.log(`${MinRpsEvent.Connected} event received`, connectedEvent);
          this.playerId.set(connectedEvent.playerId);
          this.sendJoinEvent();
        }),
    );
  }

  private subscribeToJoinedEvent(): void {
    this.subscription.add(
      this.socketService
        .fromEvent(MinRpsEvent.Joined)
        .subscribe((joinedEvent: MinRpsJoinedEvent) => {
          console.log(`${MinRpsEvent.Joined} event received`, joinedEvent);
        }),
    );
  }

  private unsubscribeFromEvents(): void {
    this.subscription.unsubscribe();
  }
}
