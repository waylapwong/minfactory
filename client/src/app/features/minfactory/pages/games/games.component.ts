import { Component } from '@angular/core';

import { CardComponent } from '../../../../shared/components/card/card.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';

@Component({
  selector: 'min-games',
  imports: [CardComponent, LogoComponent, H1Component],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent {}
