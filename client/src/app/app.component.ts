import { Component, Signal, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContextService } from './core/context/context.service';
import { FooterComponent } from './core/layout/footer/footer.component';
import { HeaderComponent } from './core/layout/header/header.component';
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

  private readonly contextService: ContextService = inject(ContextService);
}
