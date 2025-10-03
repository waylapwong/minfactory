import { Component } from '@angular/core';

import { CardComponent } from '../../../../shared/components/card/card.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';

@Component({
  selector: 'app-home',
  imports: [CardComponent, LogoComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {}
