import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { RoutingService } from '../../../../core/services/routing.service';
import { MinRpsGameService } from '../../services/minrps-game.service';
import { MinRpsSocketService } from '../../services/minrps-socket.service';

@Component({
  selector: 'app-minrps-multiplayer',
  templateUrl: './minrps-multiplayer.component.html',
  styleUrls: ['./minrps-multiplayer.component.scss'],
})
export class MinRpsMultiplayerComponent implements OnInit, OnDestroy {
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly minRpsGameService: MinRpsGameService,
    private readonly routingService: RoutingService,
    private readonly minRpsSocketService: MinRpsSocketService,
  ) {}

  public ngOnInit(): void {
    const gameId: string = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.checkGameExists(gameId).then(() => {
      this.connectToWebSocket();
    });
  }

  public ngOnDestroy(): void {
    this.minRpsSocketService.disconnect();
  }

  private async checkGameExists(id: string): Promise<void> {
    const gameExists: boolean = await this.minRpsGameService.checkGameById(id);
    if (!gameExists) {
      this.routingService.navigateToMinRpsLobby();
    }
  }

  private connectToWebSocket(): void {
    this.minRpsSocketService.connect();
  }
}
