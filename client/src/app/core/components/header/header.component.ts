import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Paths } from '../../../app.routes';
import { DividerComponent } from '../../../shared/components/divider/divider.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslatePipe, DividerComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public readonly Paths: typeof Paths = Paths;
}
