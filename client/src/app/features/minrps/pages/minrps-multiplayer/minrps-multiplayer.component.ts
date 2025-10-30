import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { RoutingService } from '../../../../core/services/routing.service';
import { MinRPSGameService } from '../../services/minrps-game.service';

@Component({
  selector: 'app-minrps-multiplayer',
  templateUrl: './minrps-multiplayer.component.html',
  styleUrls: ['./minrps-multiplayer.component.scss'],
})
export class MinRPSMultiplayerComponent implements OnInit {
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly minRPSGameService: MinRPSGameService,
    private readonly routingService: RoutingService,
  ) {}

  public ngOnInit(): void {
    const id: string | null = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) {
      this.routingService.navigateToMinRPSLobby();
      return;
    }
    this.checkGameExists(id);
  }

  private async checkGameExists(id: string): Promise<void> {
    const gameExists: boolean = await this.minRPSGameService.checkGameById(id);
    if (!gameExists) {
      this.routingService.navigateToMinRPSLobby();
    }
  }
}
