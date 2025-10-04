import { Component } from '@angular/core';

import { DividerComponent } from '../../../shared/components/divider/divider.component';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

@Component({
  selector: 'min-footer',
  imports: [DividerComponent, LogoComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  public currentYear: number = new Date().getFullYear();
}
