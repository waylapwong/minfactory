import { Component, OnInit, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { MinRpsMove, MinRpsResult } from '../../../../core/generated';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DividerComponent } from '../../../../shared/components/divider/divider.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRpsCardComponent } from '../../components/minrps-card/minrps-card.component';
import { MinRpsMoveComponent } from '../../components/minrps-move/minrps-move.component';
import { MinRpsSingleplayerViewModel } from '../../models/viewmodels/minrps-singleplayer.viewmodel';
import { MinRpsSingleplayerService } from '../../services/minrps-singleplayer.service';

@Component({
  selector: 'minrps-singleplayer',
  templateUrl: './minrps-singleplayer.component.html',
  styleUrls: ['./minrps-singleplayer.component.scss'],
  host: { class: 'block h-full' },
  imports: [ButtonComponent, DividerComponent, MinRpsMoveComponent, MinRpsCardComponent],
})
export class MinRpsSingleplayerComponent implements OnInit {
  public readonly Color: typeof Color = Color;
  public readonly MinRpsMove: typeof MinRpsMove = MinRpsMove;
  public readonly MinRpsResult: typeof MinRpsResult = MinRpsResult;

  public game: Signal<MinRpsSingleplayerViewModel> = inject(MinRpsSingleplayerService).game;
  public selectableMoves: MinRpsMove[] = [MinRpsMove.Rock, MinRpsMove.Paper, MinRpsMove.Scissors];
  public selectedMove: WritableSignal<MinRpsMove> = signal(MinRpsMove.None);
  public submitText = computed(() => {
    switch (this.selectedMove()) {
      case MinRpsMove.None:
        return 'choose move';
      case MinRpsMove.Rock:
        return `play rock!`;
      case MinRpsMove.Paper:
        return `play paper!`;
      case MinRpsMove.Scissors:
        return `play scissors!`;
      default:
        return '';
    }
  });

  constructor(private readonly singleplayerService: MinRpsSingleplayerService) {}

  public ngOnInit(): void {
    this.singleplayerService.setupNewGame();
  }

  public async playGame(): Promise<void> {
    await this.singleplayerService.playGame(this.selectedMove());
  }

  public selectMove(move: MinRpsMove): void {
    this.selectedMove.set(move);
  }
}
