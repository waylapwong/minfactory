import { Component, OnInit, Signal, WritableSignal, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MinRPSGameResponseDTO } from '../../../../core/generated';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardButtonComponent } from '../../../../shared/components/card-button/card-button.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRPSGameService } from '../../services/minrps-game.service';

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
  ],
})
export class MinRPSLobbyComponent implements OnInit {
  public readonly Color = Color;

  public formGroup!: FormGroup;
  public games: Signal<MinRPSGameResponseDTO[]> = computed(() =>
    this.minRPSGameService.gamesList(),
  );
  public isNewGameDialogOpen: WritableSignal<boolean> = signal(false);

  constructor(private readonly minRPSGameService: MinRPSGameService) {}

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
