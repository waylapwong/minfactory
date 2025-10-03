import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { Paths } from '../../../app.routes';
import { DividerComponent } from '../../../shared/components/divider/divider.component';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslatePipe, DividerComponent, LogoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public readonly Paths: typeof Paths = Paths;
}
