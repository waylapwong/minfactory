import { Component, OnDestroy, OnInit, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { AppPath } from '../../../../app.routes';
import { MinRpsMove, MinRpsResult } from '../../../../core/generated';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { DividerComponent } from '../../../../shared/components/divider/divider.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRpsCardComponent } from '../../components/minrps-card/minrps-card.component';
import { MinRpsMoveComponent } from '../../components/minrps-move/minrps-move.component';
import { MinRpsResultHistoryComponent } from '../../components/minrps-result-history/minrps-result-history.component';
import { CanLeaveGame } from '../../guards/leave-game.guard';
import { MinRpsSingleplayerViewModel } from '../../models/viewmodels/minrps-singleplayer.viewmodel';
import { MinRpsSingleplayerService } from '../../services/minrps-singleplayer.service';

@Component({
  selector: 'minrps-singleplayer',
  templateUrl: './minrps-singleplayer.component.html',
  styleUrls: ['./minrps-singleplayer.component.scss'],
  host: { class: 'block h-full' },
  imports: [
    ButtonComponent,
    DialogComponent,
    DividerComponent,
    MinRpsMoveComponent,
    MinRpsCardComponent,
    MinRpsResultHistoryComponent,
  ],
})
export class MinRpsSingleplayerComponent implements OnInit, OnDestroy, CanLeaveGame {
  public readonly AppPath: typeof AppPath = AppPath;
  public readonly Color: typeof Color = Color;
  public readonly MinRpsMove: typeof MinRpsMove = MinRpsMove;
  public readonly MinRpsResult: typeof MinRpsResult = MinRpsResult;

  public game: Signal<MinRpsSingleplayerViewModel> = inject(MinRpsSingleplayerService).game;
  public isLeaveDialogOpen: WritableSignal<boolean> = signal(false);
  public selectableMoves: MinRpsMove[] = [MinRpsMove.Rock, MinRpsMove.Paper, MinRpsMove.Scissors];
  public selectedMove: WritableSignal<MinRpsMove> = signal(MinRpsMove.None);
  public submitText = computed(() => {
    switch (this.selectedMove()) {
      case MinRpsMove.None:
        return 'Wähle einen Zug';
      case MinRpsMove.Rock:
        return `Spiele Stein!`;
      case MinRpsMove.Paper:
        return `Spiele Papier!`;
      case MinRpsMove.Scissors:
        return `Spiele Schere!`;
      default:
        return '';
    }
  });

  private leaveConfirmationResolver: ((value: boolean) => void) | null = null;

  constructor(
    public readonly routingService: RoutingService,
    private readonly singleplayerService: MinRpsSingleplayerService,
  ) {}

  public ngOnInit(): void {
    this.singleplayerService.setupNewGame(true);
  }

  public ngOnDestroy(): void {
    this.leaveConfirmationResolver?.(false);
    this.leaveConfirmationResolver = null;
  }

  public canDeactivate(): Promise<boolean> {
    this.leaveConfirmationResolver?.(false);
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

  public async playGame(): Promise<void> {
    await this.singleplayerService.playGame(this.selectedMove());
  }

  public selectMove(move: MinRpsMove): void {
    this.selectedMove.set(move);
  }
}
