import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';

import { MinRpsResult } from '../../models/enums/minrps-result.enum';

@Component({
  selector: 'minrps-move',
  templateUrl: './minrps-move.component.html',
  styleUrls: ['./minrps-move.component.scss'],
  imports: [],
})
export class MinRpsMoveComponent {
  public readonly MinRpsResult: typeof MinRpsResult = MinRpsResult;

  public isDisabled: InputSignal<boolean> = input(false);
  public isPlayed: InputSignal<boolean> = input(false);
  public isSelected: InputSignal<boolean> = input(false);
  public result: InputSignal<MinRpsResult> = input(MinRpsResult.None) as any;
  public selected: OutputEmitterRef<void> = output();
}
