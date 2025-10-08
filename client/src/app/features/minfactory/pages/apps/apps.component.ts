import { Component, WritableSignal, signal } from '@angular/core';

import { RoutingService } from '../../../../core/services/routing.service';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { CardButtonComponent } from '../../../../shared/components/card-button/card-button.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { Color } from '../../../../shared/enums/color.enum';

@Component({
  selector: 'minfactory-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss'],
  host: { class: 'flex h-full flex-col w-full items-center  gap-2 sm:gap-0' },
  imports: [BadgeComponent, CardButtonComponent, H2Component, LogoComponent],
})
export class AppsComponent {
  public readonly Color: typeof Color = Color;

  public selectedTab: WritableSignal<number> = signal(1);

  constructor(public readonly routingService: RoutingService) {}
}
