import { Component } from '@angular/core';

import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { CardButtonComponent } from '../../../../shared/components/card-button/card-button.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { Color } from '../../../../shared/enums/color.enum';

@Component({
  selector: 'minfactory-apps',
  imports: [BadgeComponent, CardButtonComponent, H1Component, H2Component, LogoComponent],
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss'],
})
export class AppsComponent {
  public readonly Color: typeof Color = Color;
}
