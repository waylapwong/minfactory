import { DatePipe } from '@angular/common';
import { Component, Signal, signal } from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardButtonComponent } from '../../../../shared/components/card-button/card-button.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MINPOKER_LOBBY_MOCK_GAMES } from '../../mocks/minpoker-lobby.mock';
import { MinPokerLobbyViewModel } from '../../models/viewmodels/minpoker-lobby.viewmodel';

@Component({
  selector: 'min-minpoker-lobby',
  templateUrl: './minpoker-lobby.component.html',
  styles: [],
  imports: [CardButtonComponent, H2Component, H1Component, ButtonComponent, DatePipe],
})
export class MinPokerLobbyComponent {
  public readonly Color: typeof Color = Color;
  public games: Signal<MinPokerLobbyViewModel[]> = signal(MINPOKER_LOBBY_MOCK_GAMES);
}