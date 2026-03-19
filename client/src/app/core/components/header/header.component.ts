import { CommonModule } from '@angular/common';
import { Component, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AppPath } from '../../../app.routes';
import { MinFactoryPath } from '../../../features/minfactory/minfactory.routes';
import { DividerComponent } from '../../../shared/components/divider/divider.component';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { PopoverComponent } from '../../../shared/components/popover/popover.component';
import { AppName } from '../../../shared/enums/app-name.enum';
import { ContextService } from '../../services/context.service';

@Component({
  selector: 'min-header',
  standalone: true,
  imports: [CommonModule, RouterLink, DividerComponent, LogoComponent, PopoverComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public readonly AppPath: typeof AppPath = AppPath;
  public readonly MinFactoryPath: typeof MinFactoryPath = MinFactoryPath;
  public readonly appVersion: Signal<string> = this.contextService.appVersion;
  public readonly isInFactory: Signal<boolean> = computed(() => this.contextService.app() === AppName.MinFactory);
  public readonly isInMinRps: Signal<boolean> = computed(() => this.contextService.app() === AppName.MinRps);
  public readonly isInRegister: Signal<boolean> = computed(() => this.currentUrl() === `/${MinFactoryPath.Register}`);

  private readonly contextService = inject(ContextService);
  private readonly router = inject(Router);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );
}
