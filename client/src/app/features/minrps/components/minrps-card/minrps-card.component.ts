import { Component, InputSignal, input } from '@angular/core';

import { MinRPSGameResult } from '../../enums/minrps-game-result.enum';

@Component({
  selector: 'minrps-card',
  templateUrl: './minrps-card.component.html',
  styleUrls: ['./minrps-card.component.scss'],
  imports: [],
})
export class MinRPSCardComponent {
  public readonly MinRPSGameResult: typeof MinRPSGameResult = MinRPSGameResult;

  public gameResult: InputSignal<MinRPSGameResult> = input(MinRPSGameResult.None) as any;
}
