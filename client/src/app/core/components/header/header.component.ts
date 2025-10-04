import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Path } from '../../../app.routes';
import { DividerComponent } from '../../../shared/components/divider/divider.component';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

@Component({
  selector: 'min-header',
  imports: [RouterLink, DividerComponent, LogoComponent, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public readonly Paths: typeof Path = Path;
}
