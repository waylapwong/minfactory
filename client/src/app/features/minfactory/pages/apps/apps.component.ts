import { Component } from '@angular/core';

import { CardComponent } from '../../../../shared/components/card/card.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';

@Component({
  selector: 'min-apps',
  imports: [CardComponent, LogoComponent],
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss']
})
export class AppsComponent {}
