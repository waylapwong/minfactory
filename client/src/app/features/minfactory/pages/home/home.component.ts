import { Component } from '@angular/core';

import { H1Component } from '../../../../shared/components/h1/h1.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';

@Component({
  selector: 'minfactory-home',
  imports: [LogoComponent, H1Component],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
