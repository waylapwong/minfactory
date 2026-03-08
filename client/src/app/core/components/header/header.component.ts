import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppPath } from '../../../app.routes';
import { DividerComponent } from '../../../shared/components/divider/divider.component';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { AppName } from '../../../shared/enums/app-name.enum';
import { ContextService } from '../../services/context.service';

@Component({
  selector: 'min-header',
  imports: [RouterLink, DividerComponent, LogoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public readonly AppPath: typeof AppPath = AppPath;
  public readonly Application: typeof AppName = AppName;

  public logoText = computed(() => {
    switch (this.contextService.app()) {
      case AppName.MinFactory:
        return 'Factory';
      case AppName.MinRps:
        return 'RPS';
      default:
        return 'Factory';
    }
  });
  public routerLink = computed(() => {
    switch (this.contextService.app()) {
      case AppName.MinFactory:
        return AppPath.Root;
      case AppName.MinRps:
        return AppPath.MinRps;
      default:
        return AppPath.Root;
    }
  });

  constructor(private readonly contextService: ContextService) {}
}
