import { DatePipe } from '@angular/common';
import { Component, OnInit, Signal, WritableSignal, signal } from '@angular/core';
import { RoutingService } from '../../../../core/routing/services/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardButtonComponent } from '../../../../shared/components/card-button/card-button.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinPokerPublicGamesVm } from '../../models/viewmodels/minpoker-public-games.vm';
import { MinPokerGameService } from '../../services/minpoker-game.service';

@Component({
  selector: 'min-minpoker-public-games',
  templateUrl: './minpoker-public-games.component.html',
  styleUrls: ['./minpoker-public-games.component.scss'],
  host: { class: 'block h-full w-full' },
  imports: [CardButtonComponent, H2Component, ButtonComponent, DatePipe],
})
export class MinPokerPublicGamesComponent implements OnInit {
  public readonly Color: typeof Color = Color;

  public errorMessage: WritableSignal<string> = signal('');
  public isError: WritableSignal<boolean> = signal(false);
  public isLoading: WritableSignal<boolean> = signal(true);
  public viewModel: Signal<MinPokerPublicGamesVm>;

  constructor(
    public readonly routingService: RoutingService,
    private readonly gameService: MinPokerGameService,
  ) {
    this.viewModel = this.gameService.publicGamesVm;
  }

  public ngOnInit(): void {
    void this.loadGames();
  }

  public async loadGames(): Promise<void> {
    this.isLoading.set(true);
    this.isError.set(false);
    this.errorMessage.set('');

    try {
      await this.gameService.loadGames();
    } catch (error) {
      this.isError.set(true);
      this.errorMessage.set(error instanceof Error ? error.message : 'Spiele konnten nicht geladen werden. Bitte versuche es erneut.');
    } finally {
      this.isLoading.set(false);
    }
  }

  public navigateToGame(id: string): void {
    this.routingService.navigateToMinPokerGame(id);
  }
}
