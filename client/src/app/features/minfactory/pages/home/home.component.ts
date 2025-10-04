import { Component } from '@angular/core';

import { H1Component } from '../../../../shared/components/h1/h1.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';

@Component({
  selector: 'min-home',
  imports: [LogoComponent, H1Component, H2Component],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {}
