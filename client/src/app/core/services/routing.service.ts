import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Path } from '../../app.routes';

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  constructor(private readonly router: Router) {}

  public navigateToHomePage(): void {
    this.router.navigate([Path.Home]);
  }

  public navigateToMinRPS(): void {
    this.router.navigate([Path.MinRPS]);
  }
}
