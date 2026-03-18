import { CommonModule } from '@angular/common';
import { Component, Signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppPath } from '../../../app.routes';
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
  public readonly appVersion: Signal<string>;
  public readonly isInFactory: Signal<boolean> = computed(() => this.contextService.app() === AppName.MinFactory);
  public readonly isInMinRps: Signal<boolean> = computed(() => this.contextService.app() === AppName.MinRps);

  constructor(private readonly contextService: ContextService) {
    this.appVersion = this.contextService.appVersion;
  }
}
