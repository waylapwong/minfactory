import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './core/components/footer/footer.component';
import { HeaderComponent } from './core/components/header/header.component';
import { DividerComponent } from './shared/components/divider/divider.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, DividerComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  protected readonly title = signal('client');
}
