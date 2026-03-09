import { Component } from '@angular/core';
import { RoutingService } from '../../../../core/services/routing.service';
import { CardButtonComponent } from '../../../../shared/components/card-button/card-button.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { Color } from '../../../../shared/enums/color.enum';

@Component({
  selector: 'minrps-home',
  templateUrl: './minrps-home.component.html',
  styleUrls: ['./minrps-home.component.scss'],
  imports: [CardButtonComponent, H2Component, LogoComponent, H1Component],
})
export class MinRpsHomeComponent {
  public readonly Color: typeof Color = Color;

  constructor(public readonly routingService: RoutingService) {}
}
