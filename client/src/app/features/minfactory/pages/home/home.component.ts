import { Component, inject } from '@angular/core';
import { RoutingService } from '../../../../core/services/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { Color } from '../../../../shared/enums/color.enum';

@Component({
  selector: 'minfactory-home',
  imports: [LogoComponent, H1Component, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  public readonly Color = Color;

  private readonly routingService = inject(RoutingService);

  public navigateToApps(): void {
    this.routingService.navigateToApps();
  }

  public navigateToRegister(): void {
    this.routingService.navigateToRegister();
  }
}
