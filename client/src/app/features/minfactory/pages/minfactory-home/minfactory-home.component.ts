import { Component } from '@angular/core';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { Color } from '../../../../shared/enums/color.enum';

@Component({
  selector: 'minfactory-home',
  templateUrl: './minfactory-home.component.html',
  styleUrls: ['./minfactory-home.component.scss'],
  imports: [LogoComponent, H1Component, ButtonComponent],
})
export class MinFactoryHomeComponent {
  public readonly Color = Color;

  constructor(public readonly routingService: RoutingService) {}
}
