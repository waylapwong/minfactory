import { Component, WritableSignal, signal } from '@angular/core';
import { RoutingService } from '../../../../core/routing/routing.service';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { CardButtonComponent } from '../../../../shared/components/card-button/card-button.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { Color } from '../../../../shared/enums/color.enum';

@Component({
  selector: 'minfactory-apps',
  templateUrl: './minfactory-apps.component.html',
  styleUrls: ['./minfactory-apps.component.scss'],
  host: { class: 'block h-full w-full' },
  imports: [BadgeComponent, CardButtonComponent, H2Component, LogoComponent],
})
export class MinFactoryAppsComponent {
  public readonly Color: typeof Color = Color;

  public selectedTab: WritableSignal<number> = signal(1);

  constructor(public readonly routingService: RoutingService) {}
}
