import { DatePipe } from '@angular/common';
import { Component, OnInit, Signal, WritableSignal, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardButtonComponent } from '../../../../shared/components/card-button/card-button.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRpsOverviewViewModel } from '../../models/viewmodels/minrps-overview.viewmodel';
import { MinRpsGameService } from '../../services/minrps-game.service';

@Component({
  selector: 'min-minrps-overview',
  templateUrl: './minrps-overview.component.html',
  styleUrls: ['./minrps-overview.component.scss'],
  imports: [
    CardButtonComponent,
    H2Component,
    H1Component,
    ButtonComponent,
    DialogComponent,
    InputComponent,
    ReactiveFormsModule,
    DatePipe,
  ],
})
export class MinRpsOverviewComponent implements OnInit {
  public readonly Color = Color;

  public games: Signal<MinRpsOverviewViewModel[]> = inject(MinRpsGameService).games;
  public isDeleteDialogOpen: WritableSignal<boolean> = signal(false);
  public isNewGameDialogOpen: WritableSignal<boolean> = signal(false);
  public newGameFormGroup: FormGroup = this.createFormGroup();

  private gameIdToDelete: string | null = null;

  constructor(
    public readonly routingService: RoutingService,
    private readonly gameService: MinRpsGameService,
  ) {}

  public get newGameName(): FormControl {
    return this.newGameFormGroup.get('name') as FormControl;
  }

  public ngOnInit(): void {
    this.gameService.refreshGames();
  }

  public cancelDeleteGame(): void {
    this.isDeleteDialogOpen.set(false);
    this.gameIdToDelete = null;
  }

  public async confirmDeleteGame(): Promise<void> {
    if (this.gameIdToDelete) {
      await this.gameService.deleteGame(this.gameIdToDelete);
    }
    this.isDeleteDialogOpen.set(false);
    this.gameIdToDelete = null;
  }

  public async createGame(): Promise<void> {
    if (this.newGameFormGroup.valid) {
      await this.gameService.createGame(this.newGameName.value);
      this.isNewGameDialogOpen.set(false);
    }
  }

  public navigateToMultiplayerPage(id: string): void {
    this.routingService.navigateToMinRpsMultiplayer(id);
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

  private createFormGroup(): FormGroup {
    return new FormGroup({
      name: new FormControl('', [Validators.maxLength(16), Validators.minLength(2), Validators.required]),
    });
  }
}
