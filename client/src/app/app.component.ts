import { Component, Signal, computed, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthenticationService } from './core/authentication/authentication.service';
import { ContextService } from './core/context/context.service';
import { FooterComponent } from './core/layout/footer/footer.component';
import { HeaderComponent } from './core/layout/header/header.component';
import { MinFactoryUserService } from './features/minfactory/services/minfactory-user.service';
import { DividerComponent } from './shared/components/divider/divider.component';
import { AppName } from './shared/enums/app-name.enum';

@Component({
  selector: 'min-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, DividerComponent],
})
export class AppComponent {
  public readonly isInMinFactory: Signal<boolean> = computed(() => this.contextService.app() === AppName.MinFactory);

  private readonly authenticationService: AuthenticationService = inject(AuthenticationService);
  private readonly contextService: ContextService = inject(ContextService);
  private readonly userService: MinFactoryUserService = inject(MinFactoryUserService);

  constructor() {
    effect(() => {
      if (!this.authenticationService.isAuthenticated()) {
        return;
      }

      void this.userService.ensureProfileLoaded().catch(() => undefined);
    });
  }
}
