import { Component, Signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppPath } from '../../../app.routes';
import { AppName } from '../../../shared/enums/app-name.enum';
import { ContextService } from '../../services/context.service';
import { DividerComponent } from '../../../shared/components/divider/divider.component';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

@Component({
  selector: 'min-header',
  standalone: true,
  imports: [CommonModule, RouterLink, DividerComponent, LogoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public readonly AppPath: typeof AppPath = AppPath;

  private readonly contextService: ContextService = inject(ContextService);

  public readonly isInFactory: Signal<boolean> = computed(() => this.contextService.app() === AppName.MinFactory);
  public readonly isInMinRps: Signal<boolean> = computed(() => this.contextService.app() === AppName.MinRps);
}
