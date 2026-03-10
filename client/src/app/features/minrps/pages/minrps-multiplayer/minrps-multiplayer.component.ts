import { Component, OnDestroy, OnInit, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MinRpsMove, MinRpsResult } from '../../../../core/generated';
import { RoutingService } from '../../../../core/services/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { DividerComponent } from '../../../../shared/components/divider/divider.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRpsCardComponent } from '../../components/minrps-card/minrps-card.component';
import { MinRpsMoveComponent } from '../../components/minrps-move/minrps-move.component';
import { CanLeaveGame } from '../../guards/leave-game.guard';
import { MinRpsMultiplayerViewModel } from '../../models/viewmodels/minrps-multiplayer.viewmodel';
import { MinRpsGameService } from '../../services/minrps-game.service';
import { MinRpsMultiplayerService } from '../../services/minrps-multiplayer.service';

@Component({
  selector: 'minrps-multiplayer',
  templateUrl: './minrps-multiplayer.component.html',
  styleUrls: ['./minrps-multiplayer.component.scss'],
  host: { class: 'block h-full' },
  imports: [
    ButtonComponent,
    DividerComponent,
    MinRpsMoveComponent,
    MinRpsCardComponent,
    DialogComponent,
    InputComponent,
    ReactiveFormsModule,
  ],
})
export class MinRpsMultiplayerComponent implements OnInit, OnDestroy, CanLeaveGame {
  public readonly Color: typeof Color = Color;
  public readonly MinRpsMove: typeof MinRpsMove = MinRpsMove;
  public readonly MinRpsResult: typeof MinRpsResult = MinRpsResult;
  public readonly SELECTABLE_MOVES: MinRpsMove[] = [MinRpsMove.Rock, MinRpsMove.Paper, MinRpsMove.Scissors];

  public game: Signal<MinRpsMultiplayerViewModel> = inject(MinRpsMultiplayerService).game;
  public isLeaveDialogOpen: WritableSignal<boolean> = signal(false);
  public isSeatDialogOpen: WritableSignal<boolean> = signal(false);
  public seatFormGroup: FormGroup = new FormGroup({});
  public selectedMove: WritableSignal<MinRpsMove> = signal(MinRpsMove.None);
  public selectedSeat: WritableSignal<0 | 1 | 2> = signal(0);
  public submitText: Signal<string> = computed(() => {
    switch (this.selectedMove()) {
      case MinRpsMove.None:
        return 'Wähle einen Zug';
      case MinRpsMove.Rock:
        return 'Spiele Stein!';
      case MinRpsMove.Paper:
        return 'Spiele Papier!';
      case MinRpsMove.Scissors:
        return 'Spiele Schere!';
      default:
        return '';
    }
  });

  private leaveConfirmationResolver: ((value: boolean) => void) | null = null;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly gameService: MinRpsGameService,
    private readonly multiplayerService: MinRpsMultiplayerService,
    public readonly routingService: RoutingService,
  ) {}

  public get seatName(): FormControl {
    return this.seatFormGroup.get('name') as FormControl<string>;
  }

  public ngOnInit() {
    this.setGameId();
    this.seatFormGroup = this.createSeatFormGroup();
    this.checkGameExists(this.game().gameId);
    this.multiplayerService.connect();
  }

  public ngOnDestroy(): void {
    this.leaveGame();
    this.multiplayerService.disconnect();
    this.leaveConfirmationResolver?.(false);
    this.leaveConfirmationResolver = null;
  }

  public closeSeatDialog(): void {
    this.isSeatDialogOpen.set(false);
  }

  public canDeactivate(): Promise<boolean> {
    this.leaveConfirmationResolver?.(false);
    this.closeSeatDialog();
    this.isLeaveDialogOpen.set(true);
    return new Promise<boolean>((resolve) => {
      this.leaveConfirmationResolver = resolve;
    });
  }

  public confirmLeave(): void {
    this.isLeaveDialogOpen.set(false);
    this.leaveConfirmationResolver?.(true);
    this.leaveConfirmationResolver = null;
  }

  public cancelLeave(): void {
    this.isLeaveDialogOpen.set(false);
    this.leaveConfirmationResolver?.(false);
    this.leaveConfirmationResolver = null;
  }

  public openSeatDialog(seat: 1 | 2): void {
    if (seat === 1 && !this.game().canTakeHeroSeat) {
      return;
    }
    if (seat === 2 && !this.game().canTakeVillainSeat) {
      return;
    }
    this.seatFormGroup = this.createSeatFormGroup();
    this.selectedSeat.set(seat);
    this.isSeatDialogOpen.set(true);
  }

  public playGame(): void {
    if (this.game().isObserver) {
      return;
    }
    this.multiplayerService.playGame(this.selectedMove());
  }

  public seatGame(): void {
    if (this.seatFormGroup.invalid || this.selectedSeat() === 0) {
      return;
    }
    const playerName: string = this.seatName.value.trim();
    if (!playerName) {
      return;
    }
    this.multiplayerService.seatGame(playerName, this.selectedSeat() as 1 | 2);
    this.selectedSeat.set(0);
    this.isSeatDialogOpen.set(false);
  }

  public selectMove(move: MinRpsMove): void {
    if (this.game().isObserver || this.game().heroHasSelectedMove) {
      return;
    }
    this.selectedMove.set(move);
  }

  private async checkGameExists(id: string): Promise<void> {
    const gameExists: boolean = await this.gameService.gameExistByID(id);
    if (!gameExists) {
      this.routingService.navigateToMinRpsOverview();
    }
  }

  private createSeatFormGroup(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.maxLength(16), Validators.required]],
    });
  }

  private leaveGame(): void {
    this.multiplayerService.leaveGame();
  }

  private setGameId(): void {
    const gameId: string = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.multiplayerService.setGameId(gameId);
  }
}
