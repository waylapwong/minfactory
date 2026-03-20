import { Component, Signal, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './core/components/footer/footer.component';
import { HeaderComponent } from './core/components/header/header.component';
import { ContextService } from './core/services/context.service';
import { AppName } from './shared/enums/app-name.enum';
import { DividerComponent } from './shared/components/divider/divider.component';

@Component({
  selector: 'min-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, DividerComponent],
})
export class AppComponent {
  public readonly isInMinFactory: Signal<boolean> = computed(() => this.contextService.app() === AppName.MinFactory);

  private readonly contextService: ContextService = inject(ContextService);
}
