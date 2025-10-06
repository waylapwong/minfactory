import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AppPath } from '../../../app.routes';
import { MinFactoryPath } from '../../../features/minfactory/minfactory.routes';
import { DividerComponent } from '../../../shared/components/divider/divider.component';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { AppName } from '../../../shared/enums/app-name.enum';
import { ContextService } from '../../services/context.service';

@Component({
  selector: 'min-header',
  imports: [RouterLink, DividerComponent, LogoComponent, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public readonly AppPath: typeof AppPath = AppPath;
  public readonly Application: typeof AppName = AppName;
  public readonly MinFactoryPath: typeof MinFactoryPath = MinFactoryPath;

  public logo = computed(() => {
    switch (this.contextService.app()) {
      case AppName.MinFactory:
        return 'Factory';
      case AppName.MinRPS:
        return 'RPS';
      default:
        return 'Factory';
    }
  });

  constructor(private readonly contextService: ContextService) {}
}
