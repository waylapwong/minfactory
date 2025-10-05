import { Component } from '@angular/core';

import { Path } from '../../../../app.routes';
import { RoutingService } from '../../../../core/services/routing.service';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { Color } from '../../../../shared/enums/color.enum';

@Component({
  selector: 'min-play',
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    H1Component,
    H2Component,
    LogoComponent
  ],
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
})
export class PlayComponent {
  public readonly Color: typeof Color = Color;
  public readonly Paths: typeof Path = Path;

  constructor(public readonly routingService: RoutingService) {}
}
