import { Component, WritableSignal, computed, signal } from '@angular/core';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DividerComponent } from '../../../../shared/components/divider/divider.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRPSMove } from '../../enums/minrps-move.enum';

@Component({
  selector: 'app-minrps-game',
  templateUrl: './minrps-game.component.html',
  styleUrls: ['./minrps-game.component.scss'],
  host: { class: 'block h-full' },
  imports: [ButtonComponent, DividerComponent],
})
export class MinRPSGameComponent {
  public readonly Color: typeof Color = Color;
  public readonly MinRPSMove: typeof MinRPSMove = MinRPSMove;

  public selectedMove: WritableSignal<MinRPSMove> = signal(MinRPSMove.None);
  public buttonText = computed(() => {
    switch (this.selectedMove()) {
      case MinRPSMove.None:
        return 'choose move ...';
      case MinRPSMove.Rock:
        return `${MinRPSMove.Rock}!`;
      case MinRPSMove.Paper:
        return `${MinRPSMove.Paper}!`;
      case MinRPSMove.Scissors:
        return `${MinRPSMove.Scissors}!`;
    }
  });
}
