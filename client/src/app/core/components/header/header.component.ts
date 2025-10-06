import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Path } from '../../../app.routes';
import { DividerComponent } from '../../../shared/components/divider/divider.component';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { Application } from '../../../shared/enums/application.enum';
import { ContextService } from '../../services/context.service';

@Component({
  selector: 'min-header',
  imports: [RouterLink, DividerComponent, LogoComponent, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public readonly Application: typeof Application = Application;
  public readonly Paths: typeof Path = Path;

  public logo = computed(() => {
    switch (this.contextService.app()) {
      case Application.MinFactory:
        return 'Factory';
      case Application.MinRPS:
        return 'RPS';
      default:
        return 'Factory';
    }
  });

  constructor(private readonly contextService: ContextService) {}
}
