import { Component } from '@angular/core';

import { RoutingService } from '../../../../core/services/routing.service';
import { CardButtonComponent } from '../../../../shared/components/card-button/card-button.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { Color } from '../../../../shared/enums/color.enum';

@Component({
  selector: 'minrps-home',
  templateUrl: './minrps-home.component.html',
  styleUrls: ['./minrps-home.component.scss'],
  host: { class: 'flex h-full flex-row items-center justify-evenly gap-2 sm:gap-0' },
  imports: [CardButtonComponent, H2Component, LogoComponent, ],
})
export class MinRPSHomeComponent {
  public readonly Color = Color;

  constructor(public readonly routingService: RoutingService) {}
}
