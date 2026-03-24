import { DatePipe } from '@angular/common';
import { Component, OnInit, Signal, WritableSignal, signal } from '@angular/core';
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
  public readonly errorMessage: WritableSignal<string> = signal('');
  public readonly isError: WritableSignal<boolean> = signal(false);
  public readonly isLoading: WritableSignal<boolean> = signal(true);

  public games: Signal<MinPokerLobbyViewModel[]>;

  constructor(
    public readonly routingService: RoutingService,
    private readonly gameService: MinPokerGameService,
  ) {
    this.games = this.gameService.lobbyViewModels;
  }

  public ngOnInit(): void {
    this.reloadGames();
  }

  public reloadGames(): void {
    void this.loadLobbyGames();
  }

  private async loadLobbyGames(): Promise<void> {
    this.isLoading.set(true);
    this.isError.set(false);
    this.errorMessage.set('');

    try {
      await this.gameService.loadGames();
    } catch (error) {
      this.isError.set(true);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Spiele konnten nicht geladen werden. Bitte versuche es erneut.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
