import { Component } from '@angular/core';

import { CardComponent } from '../../../../shared/components/card/card.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';

@Component({
  selector: 'min-apps',
  imports: [CardComponent, LogoComponent, H1Component],
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss']
})
export class AppsComponent {}
