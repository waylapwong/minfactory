import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';

import { MinRPSResult } from '../../models/enums/minrps-result.enum';

@Component({
  selector: 'minrps-move',
  templateUrl: './minrps-move.component.html',
  styleUrls: ['./minrps-move.component.scss'],
  imports: [],
})
export class MinRPSMoveComponent {
  public readonly MinRPSGameResult: typeof MinRPSResult = MinRPSResult;

  public disabled: InputSignal<boolean> = input(false);
  public gameResult: InputSignal<MinRPSResult> = input(MinRPSResult.None) as any;
  public isLocked: InputSignal<boolean> = input(false);
  public isSelected: InputSignal<boolean> = input(false);
  public selected: OutputEmitterRef<void> = output();
}
