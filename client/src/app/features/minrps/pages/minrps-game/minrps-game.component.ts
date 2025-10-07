import { Component, OnInit, Signal, WritableSignal, computed, signal } from '@angular/core';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DividerComponent } from '../../../../shared/components/divider/divider.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRPSCardComponent } from '../../components/minrps-card/minrps-card.component';
import { MinRPSMoveComponent } from '../../components/minrps-move/minrps-move.component';
import { MinRPSMove } from '../../models/enums/minrps-move.enum';
import { MinRPSResult } from '../../models/enums/minrps-result.enum';
import { MinRPSGameService } from '../../services/minrps-game.service';

@Component({
  selector: 'minrps-game',
  templateUrl: './minrps-game.component.html',
  styleUrls: ['./minrps-game.component.scss'],
  host: { class: 'block h-full' },
  imports: [ButtonComponent, DividerComponent, MinRPSMoveComponent, MinRPSCardComponent],
})
export class MinRPSGameComponent implements OnInit {
  public readonly Color: typeof Color = Color;
  public readonly MinRPSMove: typeof MinRPSMove = MinRPSMove;

  public selectedHeroMove: WritableSignal<MinRPSMove> = signal(MinRPSMove.None);
  public buttonText = computed(() => {
    switch (this.selectedHeroMove()) {
      case MinRPSMove.None:
        return 'choose move';
      case MinRPSMove.Rock:
        return `play rock!`;
      case MinRPSMove.Paper:
        return `play paper!`;
      case MinRPSMove.Scissors:
        return `play scissors!`;
    }
  });
  public message: Signal<string> = computed(() => this.minRPSGameService.message());
  public playedHeroMove: Signal<MinRPSMove> = computed(() => this.minRPSGameService.player1Move());
  public playedVillainMove: Signal<MinRPSMove> = computed(() =>
    this.minRPSGameService.player2Move(),
  );
  public result: Signal<MinRPSResult> = computed(() => this.minRPSGameService.result());

  constructor(private readonly minRPSGameService: MinRPSGameService) {}

  public ngOnInit(): void {
    this.minRPSGameService.setupNewGame();
  }

  public async startGame() {
    await this.minRPSGameService.startGame(this.selectedHeroMove());
    this.selectedHeroMove.set(MinRPSMove.None);
  }
}
