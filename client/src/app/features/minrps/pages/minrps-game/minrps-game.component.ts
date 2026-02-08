import { Component, OnInit, Signal, WritableSignal, computed, signal } from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DividerComponent } from '../../../../shared/components/divider/divider.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRpsCardComponent } from '../../components/minrps-card/minrps-card.component';
import { MinRpsMoveComponent } from '../../components/minrps-move/minrps-move.component';
import { MinRpsMove } from '../../models/enums/minrps-move.enum';
import { MinRpsResult } from '../../models/enums/minrps-result.enum';
import { MinRpsGameService } from '../../services/minrps-game.service';

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
  public readonly heroMoves = [MinRpsMove.Rock, MinRpsMove.Paper, MinRpsMove.Scissors];

  public selectedHeroMove: WritableSignal<MinRpsMove> = signal(MinRpsMove.None);
  public buttonText = computed(() => {
    switch (this.selectedHeroMove()) {
      case MinRpsMove.None:
        return 'choose move';
      case MinRpsMove.Rock:
        return `play rock!`;
      case MinRpsMove.Paper:
        return `play paper!`;
      case MinRpsMove.Scissors:
        return `play scissors!`;
    }
  });
  public message: Signal<string> = computed(() => this.minRPSGameService.message());
  public playedHeroMove: Signal<MinRpsMove> = computed(() => this.minRPSGameService.player1Move());
  public playedVillainMove: Signal<MinRpsMove> = computed(() =>
    this.minRPSGameService.player2Move(),
  );
  public result: Signal<MinRpsResult> = computed(() => this.minRPSGameService.result());

  constructor(private readonly minRPSGameService: MinRpsGameService) {}

  public ngOnInit(): void {
    this.minRPSGameService.setupNewGame();
  }

  public async startGame(): Promise<void> {
    await this.minRPSGameService.startGame(this.selectedHeroMove());
    this.selectedHeroMove.set(MinRpsMove.None);
  }
}
