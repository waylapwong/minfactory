import { CommonModule } from '@angular/common';
import { Component, Signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AppPath } from '../../../app.routes';
import { MinFactoryPath } from '../../../features/minfactory/minfactory.routes';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { PopoverComponent } from '../../../shared/components/popover/popover.component';
import { AppName } from '../../../shared/enums/app-name.enum';
import { AuthenticationService } from '../../authentication/authentication.service';
import { ContextService } from '../../context/context.service';

@Component({
  selector: 'min-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [CommonModule, RouterLink, LogoComponent, PopoverComponent],
})
export class HeaderComponent {
  public readonly AppPath: typeof AppPath = AppPath;
  public readonly MinFactoryPath: typeof MinFactoryPath = MinFactoryPath;
  public readonly accountRouterLink: Signal<string[]>;
  public readonly appVersion: Signal<string>;
  public readonly isAuthenticated: Signal<boolean>;
  public readonly isInFactory: Signal<boolean>;
  public readonly isInMinPoker: Signal<boolean>;
  public readonly isInLogin: Signal<boolean>;
  public readonly isInMinRps: Signal<boolean>;
  public readonly isInProfile: Signal<boolean>;
  public readonly isInRegister: Signal<boolean>;

  private readonly currentUrl: Signal<string>;

  constructor(
    private readonly router: Router,
    private readonly contextService: ContextService,
    private readonly authService: AuthenticationService,
  ) {
    this.appVersion = this.contextService.appVersion;
    this.isAuthenticated = this.authService.isAuthenticated;
    this.accountRouterLink = computed(() =>
      this.isAuthenticated() ? [AppPath.Root, MinFactoryPath.Profile] : [AppPath.Root, MinFactoryPath.Login],
    );
    this.currentUrl = toSignal(
      this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(() => this.router.url),
        startWith(this.router.url),
      ),
      { initialValue: this.router.url },
    );
    this.isInFactory = computed(() => this.contextService.app() === AppName.MinFactory);
    this.isInMinPoker = computed(() => this.contextService.app() === AppName.MinPoker);
    this.isInMinRps = computed(() => this.contextService.app() === AppName.MinRps);
    this.isInProfile = computed(() => this.currentUrl() === `/${MinFactoryPath.Profile}`);
    this.isInRegister = computed(() => this.currentUrl() === `/${MinFactoryPath.Register}`);
    this.isInLogin = computed(() => this.currentUrl() === `/${MinFactoryPath.Login}`);
  }
}
