import { Component } from '@angular/core';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

@Component({
  selector: 'min-footer',
  imports: [LogoComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  public currentYear: number = new Date().getFullYear();
}
