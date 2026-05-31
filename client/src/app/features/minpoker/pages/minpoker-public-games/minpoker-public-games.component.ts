import { DatePipe } from '@angular/common';
import { Component, OnInit, Signal, WritableSignal, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MinPokerGameVisibility } from '../../../../core/generated';
import { LoggerService } from '../../../../core/logging/services/logger.service';
import { RoutingService } from '../../../../core/routing/services/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardButtonComponent } from '../../../../shared/components/card-button/card-button.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinPokerPublicGamesVm } from '../../models/viewmodels/minpoker-public-games.vm';
import { MinPokerGameService } from '../../services/minpoker-game.service';

@Component({
  selector: 'min-minpoker-public-games',
  templateUrl: './minpoker-public-games.component.html',
  styleUrls: ['./minpoker-public-games.component.scss'],
  host: { class: 'block h-full w-full' },
  imports: [CardButtonComponent, H2Component, ButtonComponent, DialogComponent, InputComponent, ReactiveFormsModule, DatePipe],
})
export class MinPokerPublicGamesComponent implements OnInit {
  public readonly Color: typeof Color = Color;

  private readonly logger: LoggerService = new LoggerService(MinPokerPublicGamesComponent.name);

  public errorMessage: WritableSignal<string> = signal('');
  public isError: WritableSignal<boolean> = signal(false);
  public isLoading: WritableSignal<boolean> = signal(true);
  public isNewGameDialogOpen: WritableSignal<boolean> = signal(false);
  public newGameFormGroup: FormGroup = this.createFormGroup();
  public viewModel: Signal<MinPokerPublicGamesVm>;

  constructor(
    public readonly routingService: RoutingService,
    private readonly gameService: MinPokerGameService,
  ) {
    this.viewModel = this.gameService.publicGamesVm;
  }

  public get newGameName(): FormControl {
    return this.newGameFormGroup.get('name') as FormControl;
  }

  public ngOnInit(): void {
    this.logger.debug(`START ngOnInit()`);
    void this.loadGames();
    this.logger.debug(`END ngOnInit(...)`);
  }

  public async createGame(): Promise<void> {
    this.logger.debug(`START createGame()`);
    if (this.newGameFormGroup.valid) {
      try {
        await this.gameService.createGame(this.newGameName.value, MinPokerGameVisibility.Public);
        this.isNewGameDialogOpen.set(false);
      } catch (error: unknown) {
        this.isError.set(true);
        this.errorMessage.set(error instanceof Error ? error.message : 'Spiel konnte nicht erstellt werden.');
      }
    }
    this.logger.debug(`END createGame(...)`);
  }

  public async loadGames(): Promise<void> {
    this.logger.debug(`START loadGames()`);
    this.isLoading.set(true);
    this.isError.set(false);
    this.errorMessage.set('');

    try {
      await this.gameService.loadGames(MinPokerGameVisibility.Public);
    } catch (error) {
      this.isError.set(true);
      this.errorMessage.set(error instanceof Error ? error.message : 'Spiele konnten nicht geladen werden. Bitte versuche es erneut.');
    } finally {
      this.isLoading.set(false);
      this.logger.debug(`END loadGames(...)`);
    }
  }

  public navigateToGame(id: string): void {
    this.logger.debug(`START navigateToGame(id: ${id})`);
    this.routingService.navigateToMinPokerGame(id);
    this.logger.debug(`END navigateToGame(...)`);
  }

  public openNewGameDialog(): void {
    this.logger.debug(`START openNewGameDialog()`);
    this.newGameFormGroup = this.createFormGroup();
    this.isNewGameDialogOpen.set(true);
    this.logger.debug(`END openNewGameDialog(...)`);
  }

  private createFormGroup(): FormGroup {
    this.logger.debug(`START createFormGroup()`);
    try {
      return new FormGroup({
        name: new FormControl('', {
          nonNullable: true,
          validators: [Validators.maxLength(32), Validators.minLength(2), Validators.required],
        }),
      });
    } finally {
      this.logger.debug(`END createFormGroup(...)`);
    }
  }
}
