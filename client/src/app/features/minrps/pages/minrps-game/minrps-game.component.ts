import { Component, OnInit, computed } from '@angular/core';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DividerComponent } from '../../../../shared/components/divider/divider.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRPSCardComponent } from '../../components/minrps-card/minrps-card.component';
import { MinRPSMoveComponent } from '../../components/minrps-move/minrps-move.component';
import { MinRPSMove } from '../../models/enums/minrps-move.enum';
import { MinRPSGameService } from '../../services/minrps-game.service';

@Component({
  selector: 'minrps-game',
  templateUrl: './minrps-game.component.html',
  styleUrls: ['./minrps-game.component.scss'],
  host: { class: 'block h-full' },
  imports: [ButtonComponent, DividerComponent, MinRPSMoveComponent, MinRPSCardComponent],
})
export class MinRPSGameComponent implements OnInit {
  public static readonly GAME_ROUND_DURATION = 13000;
  public static readonly SINGLE_MESSAGE_DURATION = 3000;
  public static readonly TOTAL_MESSAGE_DURATION = 10000;

  public readonly Color: typeof Color = Color;
  public readonly MinRPSMove: typeof MinRPSMove = MinRPSMove;

  public buttonText = computed(() => {
    switch (this.minRPSGameService.player1MovePreview()) {
      case MinRPSMove.None:
        return 'choose move';
      case MinRPSMove.Rock:
        return `play ${MinRPSMove.Rock}!`;
      case MinRPSMove.Paper:
        return `play ${MinRPSMove.Paper}!`;
      case MinRPSMove.Scissors:
        return `play ${MinRPSMove.Scissors}!`;
    }
  });

  constructor(public readonly minRPSGameService: MinRPSGameService) {}

  public ngOnInit(): void {
    this.minRPSGameService.startGame();
  }
}
