import { DatePipe } from '@angular/common';
import { Component, OnInit, Signal, WritableSignal, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MinRpsGameResponseDto } from '../../../../core/generated';
import { RoutingService } from '../../../../core/services/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardButtonComponent } from '../../../../shared/components/card-button/card-button.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRpsGameService } from '../../services/minrps-game.service';

@Component({
  selector: 'min-minrps-lobby',
  templateUrl: './minrps-lobby.component.html',
  styleUrls: ['./minrps-lobby.component.scss'],
  host: { class: 'h-full flex flex-col gap-2' },
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
export class MinRpsLobbyComponent implements OnInit {
  public readonly Color = Color;

  public formGroup!: FormGroup;
  public games: Signal<MinRpsGameResponseDto[]> = computed(() =>
    this.minRPSGameService.gamesList(),
  );
  public isNewGameDialogOpen: WritableSignal<boolean> = signal(false);

  constructor(
    public readonly routingService: RoutingService,
    private readonly minRPSGameService: MinRpsGameService,
  ) {}

  public get gameName(): FormControl {
    return this.formGroup.get('gameName') as FormControl;
  }

  public ngOnInit(): void {
    this.minRPSGameService.getAllGames();
    this.initFormGroup();
  }

  public async createNewGame(): Promise<void> {
    if (this.formGroup.valid) {
      await this.minRPSGameService.createNewGame(this.gameName.value);
      this.isNewGameDialogOpen.set(false);
    }
  }

  public async deleteGame(id: string): Promise<void> {
    await this.minRPSGameService.deleteGameById(id);
  }

  public navigateToMinRpsMultiplayer(id: string): void {
    this.routingService.navigateToMinRpsMultiplayer(id);
  }

  public openNewGameDialog(): void {
    this.initFormGroup();
    this.isNewGameDialogOpen.set(true);
  }

  private initFormGroup(): void {
    this.formGroup = new FormGroup({
      gameName: new FormControl<string>('', [
        Validators.maxLength(32),
        Validators.minLength(2),
        Validators.required,
      ]),
    });
  }
}
