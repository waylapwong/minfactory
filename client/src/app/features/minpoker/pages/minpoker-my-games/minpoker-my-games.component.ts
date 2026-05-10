import { DatePipe } from '@angular/common';
import { Component, OnInit, Signal, WritableSignal, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  selector: 'min-minpoker-my-games',
  templateUrl: './minpoker-my-games.component.html',
  styleUrls: ['./minpoker-my-games.component.scss'],
  host: { class: 'block h-full w-full' },
  imports: [CardButtonComponent, H2Component, ButtonComponent, DialogComponent, InputComponent, ReactiveFormsModule, DatePipe],
})
export class MinPokerMyGamesComponent implements OnInit {
  public readonly Color: typeof Color = Color;
  public readonly errorMessage: WritableSignal<string> = signal('');
  public readonly isError: WritableSignal<boolean> = signal(false);
  public readonly isLoading: WritableSignal<boolean> = signal(true);

  public isDeleteDialogOpen: WritableSignal<boolean> = signal(false);
  public isNewGameDialogOpen: WritableSignal<boolean> = signal(false);
  private logger: LoggerService = new LoggerService(MinPokerMyGamesComponent.name);

  public newGameFormGroup: FormGroup = this.createFormGroup();
  public viewModel: Signal<MinPokerPublicGamesVm>;

  private gameIdToDelete: string | null = null;

  constructor(
    public readonly routingService: RoutingService,
    private readonly gameService: MinPokerGameService,
  ) {
    this.viewModel = this.gameService.publicGamesVm;
  }

  public get newGameName(): FormControl {
    this.logger.debug(`START newGameName()`);
    try {
      return this.newGameFormGroup.get('name') as FormControl;
    } finally {
      this.logger.debug(`END newGameName(...)`);
    }
  }

  public ngOnInit(): void {
    this.logger.debug(`START ngOnInit()`);
    this.reloadGames();
    this.logger.debug(`END ngOnInit(...)`);
  }

  public cancelDeleteGame(): void {
    this.logger.debug(`START cancelDeleteGame()`);
    this.isDeleteDialogOpen.set(false);
    this.gameIdToDelete = null;
    this.logger.debug(`END cancelDeleteGame(...)`);
  }

  public async confirmDeleteGame(): Promise<void> {
    this.logger.debug(`START confirmDeleteGame()`);
    if (this.gameIdToDelete) {
      try {
        await this.gameService.deleteGame(this.gameIdToDelete);
      } catch (error: unknown) {
        this.isError.set(true);
        this.errorMessage.set(error instanceof Error ? error.message : 'Spiel konnte nicht gelöscht werden.');
      }
    }
    this.isDeleteDialogOpen.set(false);
    this.gameIdToDelete = null;
    this.logger.debug(`END confirmDeleteGame(...)`);
  }

  public async createGame(): Promise<void> {
    this.logger.debug(`START createGame()`);
    if (this.newGameFormGroup.valid) {
      try {
        await this.gameService.createGame(this.newGameName.value);
        this.isNewGameDialogOpen.set(false);
      } catch (error: unknown) {
        this.isError.set(true);
        this.errorMessage.set(error instanceof Error ? error.message : 'Spiel konnte nicht erstellt werden.');
      }
    }
    this.logger.debug(`END createGame(...)`);
  }

  public navigateToGame(id: string): void {
    this.logger.debug(`START navigateToGame(id: ${id})`);
    this.routingService.navigateToMinPokerGame(id);
    this.logger.debug(`END navigateToGame(...)`);
  }

  public openDeleteDialog(id: string, event: MouseEvent): void {
    this.logger.debug(`START openDeleteDialog(id: ${id}, event: ${event.type})`);
    event.stopPropagation();
    this.gameIdToDelete = id;
    this.isDeleteDialogOpen.set(true);
    this.logger.debug(`END openDeleteDialog(...)`);
  }

  public openNewGameDialog(): void {
    this.logger.debug(`START openNewGameDialog()`);
    this.newGameFormGroup = this.createFormGroup();
    this.isNewGameDialogOpen.set(true);
    this.logger.debug(`END openNewGameDialog(...)`);
  }

  public reloadGames(): void {
    this.logger.debug(`START reloadGames()`);
    void this.loadGames();
    this.logger.debug(`END reloadGames(...)`);
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

  private async loadGames(): Promise<void> {
    this.logger.debug(`START loadGames()`);
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
      this.logger.debug(`END loadGames(...)`);
    }
  }
}
