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

  public selected: OutputEmitterRef<void> = output();
  public isDisabled: InputSignal<boolean> = input(false);
  public isPlayed: InputSignal<boolean> = input(false);
  public isSelected: InputSignal<boolean> = input(false);
  public result: InputSignal<MinRPSResult> = input(MinRPSResult.None) as any;
}
