import { Component } from '@angular/core';

import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { Color } from '../../../../shared/enums/color.enum';

@Component({
  selector: 'min-play',
  imports: [CardComponent, LogoComponent, H1Component, BadgeComponent, H2Component],
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
})
export class PlayComponent {
  public readonly Color: typeof Color = Color;
}
