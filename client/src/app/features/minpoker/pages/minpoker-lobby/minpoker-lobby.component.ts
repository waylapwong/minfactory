import { DatePipe } from '@angular/common';
import { Component, OnInit, Signal, WritableSignal, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardButtonComponent } from '../../../../shared/components/card-button/card-button.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinPokerLobbyViewModel } from '../../models/viewmodels/minpoker-lobby.viewmodel';
import { MinPokerGameService } from '../../services/minpoker-game.service';

@Component({
  selector: 'min-minpoker-lobby',
  templateUrl: './minpoker-lobby.component.html',
  styleUrls: ['./minpoker-lobby.component.scss'],
  host: { class: 'block h-full w-full' },
  imports: [
    CardButtonComponent,
    H2Component,
    ButtonComponent,
    DialogComponent,
    InputComponent,
    ReactiveFormsModule,
    DatePipe,
  ],
})
export class MinPokerLobbyComponent implements OnInit {
  public readonly Color: typeof Color = Color;
  public readonly errorMessage: WritableSignal<string> = signal('');
  public readonly isError: WritableSignal<boolean> = signal(false);
  public readonly isLoading: WritableSignal<boolean> = signal(true);

  public games: Signal<MinPokerLobbyViewModel[]>;
  public isDeleteDialogOpen: WritableSignal<boolean> = signal(false);
  public isNewGameDialogOpen: WritableSignal<boolean> = signal(false);
  public newGameFormGroup: FormGroup = this.createFormGroup();

  private gameIdToDelete: string | null = null;

  constructor(
    public readonly routingService: RoutingService,
    private readonly gameService: MinPokerGameService,
  ) {
    this.games = this.gameService.lobbyViewModels;
  }

  public get newGameName(): FormControl {
    return this.newGameFormGroup.get('name') as FormControl;
  }

  public ngOnInit(): void {
    this.reloadGames();
  }

  public cancelDeleteGame(): void {
    this.isDeleteDialogOpen.set(false);
    this.gameIdToDelete = null;
  }

  public async confirmDeleteGame(): Promise<void> {
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
  }

  public async createGame(): Promise<void> {
    if (this.newGameFormGroup.valid) {
      try {
        await this.gameService.createGame(this.newGameName.value);
        this.isNewGameDialogOpen.set(false);
      } catch (error: unknown) {
        this.isError.set(true);
        this.errorMessage.set(error instanceof Error ? error.message : 'Spiel konnte nicht erstellt werden.');
      }
    }
  }

  public navigateToGame(id: string): void {
    this.routingService.navigateToMinPokerGame(id);
  }

  public openDeleteDialog(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.gameIdToDelete = id;
    this.isDeleteDialogOpen.set(true);
  }

  public openNewGameDialog(): void {
    this.newGameFormGroup = this.createFormGroup();
    this.isNewGameDialogOpen.set(true);
  }

  public reloadGames(): void {
    void this.loadLobbyGames();
  }

  private createFormGroup(): FormGroup {
    return new FormGroup({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.maxLength(32), Validators.minLength(2), Validators.required],
      }),
    });
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
