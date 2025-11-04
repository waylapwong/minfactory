import { Component, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { RoutingService } from '../../../../core/services/routing.service';
import { MinRpsEvent } from '../../models/enums/minrps-event.enum';
import { MinRpsConnectedEvent } from '../../models/events/minrps-connected.event';
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

  public ngOnInit(): void {
    this.socketService.connect();
    this.subscribeToEvents();
    this.setGameId();
    this.checkGameExists(this.gameId());
  }

  public ngOnDestroy(): void {
    this.unsubscribeFromEvents();
    this.socketService.disconnect();
  }

  private async checkGameExists(id: string): Promise<void> {
    const gameExists: boolean = await this.gameService.checkGameById(id);
    if (!gameExists) {
      this.routingService.navigateToMinRpsLobby();
    }
  }

  private setGameId(): void {
    const gameId = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.gameId.set(gameId);
  }

  private subscribeToEvents(): void {
    this.subscription.add(
      this.socketService
        .fromEvent<MinRpsConnectedEvent>(MinRpsEvent.Connected)
        .subscribe((event: MinRpsConnectedEvent) => {
          console.log(event);
          this.playerId.set(event.playerId);
        }),
    );
  }

  private unsubscribeFromEvents(): void {
    this.subscription.unsubscribe();
  }
}
