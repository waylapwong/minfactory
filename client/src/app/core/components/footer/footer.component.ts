import { Component } from '@angular/core';
import * as packageJson from '../../../../../package.json';
import { DividerComponent } from '../../../shared/components/divider/divider.component';

@Component({
  selector: 'app-footer',
  imports: [DividerComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  public currentYear: number = new Date().getFullYear();
  public version: string = packageJson.version;
}
