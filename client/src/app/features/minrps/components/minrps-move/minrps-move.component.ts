import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';

import { MinRPSGameResult } from '../../enums/minrps-game-result.enum';

@Component({
  selector: 'minrps-move',
  templateUrl: './minrps-move.component.html',
  styleUrls: ['./minrps-move.component.scss'],
  imports: [],
})
export class MinRPSMoveComponent {
  public readonly MinRPSGameResult: typeof MinRPSGameResult = MinRPSGameResult;

  public disabled: InputSignal<boolean> = input(false);
  public gameResult: InputSignal<MinRPSGameResult> = input(MinRPSGameResult.None) as any;
  public isLocked: InputSignal<boolean> = input(false);
  public isSelected: InputSignal<boolean> = input(false);
  public selected: OutputEmitterRef<void> = output();
}
