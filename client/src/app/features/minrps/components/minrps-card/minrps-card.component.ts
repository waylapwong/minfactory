import { Component, InputSignal, input } from '@angular/core';

import { MinRpsResult } from '../../models/enums/minrps-result.enum';

@Component({
  selector: 'minrps-card',
  templateUrl: './minrps-card.component.html',
  styleUrls: ['./minrps-card.component.scss'],
  imports: [],
})
export class MinRpsCardComponent {
  public readonly MinRpsResult: typeof MinRpsResult = MinRpsResult;

  public result: InputSignal<MinRpsResult> = input(MinRpsResult.None) as any;
}
