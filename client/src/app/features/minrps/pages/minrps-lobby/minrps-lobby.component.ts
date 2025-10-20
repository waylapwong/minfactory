import { Component, OnInit, Signal, computed } from '@angular/core';

import { MinRPSGameResponseDTO } from '../../../../core/generated';
import { CardButtonComponent } from '../../../../shared/components/card-button/card-button.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { MinRPSGameService } from '../../services/minrps-game.service';

@Component({
  selector: 'app-minrps-lobby',
  templateUrl: './minrps-lobby.component.html',
  styleUrls: ['./minrps-lobby.component.scss'],
  host: { class: 'flex h-full flex-row items-center justify-evenly gap-2 sm:gap-0' },
  imports: [CardButtonComponent, H2Component],
})
export class MinRPSLobbyComponent implements OnInit {
  public games: Signal<MinRPSGameResponseDTO[]> = computed(() =>
    this.minRPSGameService.gamesList(),
  );

  constructor(private readonly minRPSGameService: MinRPSGameService) {}

  public ngOnInit(): void {
    this.minRPSGameService.getAllGames();
  }
}
