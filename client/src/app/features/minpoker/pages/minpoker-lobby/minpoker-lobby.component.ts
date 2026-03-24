import { DatePipe } from '@angular/common';
import { Component, OnInit, Signal } from '@angular/core';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardButtonComponent } from '../../../../shared/components/card-button/card-button.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinPokerLobbyViewModel } from '../../models/viewmodels/minpoker-lobby.viewmodel';
import { MinPokerGameService } from '../../services/minpoker-game.service';

@Component({
  selector: 'min-minpoker-lobby',
  templateUrl: './minpoker-lobby.component.html',
  styleUrls: ['./minpoker-lobby.component.scss'],
  host: { class: 'block h-full w-full' },
  imports: [CardButtonComponent, H2Component, ButtonComponent, DatePipe],
})
export class MinPokerLobbyComponent implements OnInit {
  public readonly Color: typeof Color = Color;

  public games: Signal<MinPokerLobbyViewModel[]>;

  constructor(
    public readonly routingService: RoutingService,
    private readonly gameService: MinPokerGameService,
  ) {
    this.games = this.gameService.lobbyViewModels;
  }

  public ngOnInit(): void {
    this.gameService.loadGames();
  }
}
