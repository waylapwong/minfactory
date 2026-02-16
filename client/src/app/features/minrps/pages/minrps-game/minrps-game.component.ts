import { Component, OnInit, Signal, computed, inject } from '@angular/core';
import { MinRpsMove } from '../../../../core/generated';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DividerComponent } from '../../../../shared/components/divider/divider.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRpsCardComponent } from '../../components/minrps-card/minrps-card.component';
import { MinRpsMoveComponent } from '../../components/minrps-move/minrps-move.component';
import { MinRpsSingleplayerViewModel } from '../../models/viewmodels/minrps-singleplayer.viewmodel';
import { MinRpsSingleplayerService } from '../../services/minrps-singleplayer.service';

@Component({
  selector: 'minrps-game',
  templateUrl: './minrps-game.component.html',
  styleUrls: ['./minrps-game.component.scss'],
  host: { class: 'block h-full' },
  imports: [ButtonComponent, DividerComponent, MinRpsMoveComponent, MinRpsCardComponent],
})
export class MinRpsGameComponent implements OnInit {
  public readonly Color: typeof Color = Color;
  public readonly MinRpsMove: typeof MinRpsMove = MinRpsMove;

  public game: Signal<MinRpsSingleplayerViewModel> = inject(MinRpsSingleplayerService).game;
  public selectableMoves: MinRpsMove[] = [MinRpsMove.Rock, MinRpsMove.Paper, MinRpsMove.Scissors];
  public submitText = computed(() => {
    switch (this.game().player1SelectedMove) {
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
    await this.singleplayerService.playGame();
  }

  public selectMove(move: MinRpsMove): void {
    this.singleplayerService.selectMove(move);
  }
}
