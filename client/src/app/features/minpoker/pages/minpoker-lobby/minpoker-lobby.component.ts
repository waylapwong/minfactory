import { DatePipe } from '@angular/common';
import { Component, Signal, signal } from '@angular/core';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardButtonComponent } from '../../../../shared/components/card-button/card-button.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MINPOKER_LOBBY_MOCK_GAMES } from '../../mocks/minpoker-lobby.mock';
import { MinPokerLobbyViewModel } from '../../models/viewmodels/minpoker-lobby.viewmodel';

@Component({
  selector: 'min-minpoker-lobby',
  templateUrl: './minpoker-lobby.component.html',
  styleUrls: ['./minpoker-lobby.component.scss'],
  host: { class: 'block h-full w-full' },
  imports: [CardButtonComponent, H2Component, ButtonComponent, DatePipe, H2Component],
})
export class MinPokerLobbyComponent {
  public readonly Color: typeof Color = Color;

  public games: Signal<MinPokerLobbyViewModel[]> = signal(MINPOKER_LOBBY_MOCK_GAMES);

  constructor(public readonly routingService: RoutingService) {}
}
