import { Component } from '@angular/core';

import { CardComponent } from '../../../../shared/components/card/card.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';

@Component({
  selector: 'min-games',
  imports: [CardComponent, LogoComponent],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent {}
