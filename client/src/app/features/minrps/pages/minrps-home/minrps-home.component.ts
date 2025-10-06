import { Component } from '@angular/core';

import { RoutingService } from '../../../../core/services/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { Color } from '../../../../shared/enums/color.enum';

@Component({
  selector: 'min-minrps-home',
  templateUrl: './minrps-home.component.html',
  styleUrls: ['./minrps-home.component.scss'],
  host: { class: 'block h-full' },
  imports: [CardComponent, H2Component, ButtonComponent],
})
export class MinRPSHomeComponent {
  public readonly Color = Color;

  constructor(public readonly routingService: RoutingService) {}
}
