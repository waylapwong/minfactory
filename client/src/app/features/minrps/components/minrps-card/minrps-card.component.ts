import { Component, InputSignal, input } from '@angular/core';

import { MinRPSResult } from '../../models/enums/minrps-result.enum';

@Component({
  selector: 'minrps-card',
  templateUrl: './minrps-card.component.html',
  styleUrls: ['./minrps-card.component.scss'],
  imports: [],
})
export class MinRPSCardComponent {
  public readonly MinRPSGameResult: typeof MinRPSResult = MinRPSResult;

  public result: InputSignal<MinRPSResult> = input(MinRPSResult.None) as any;
}
