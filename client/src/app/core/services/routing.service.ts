import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AppPath } from '../../app.routes';

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  constructor(private readonly router: Router) {}

  public navigateToHomePage(): void {
    this.router.navigate([AppPath.Root]);
  }

  public navigateToMinRPS(): void {
    this.router.navigate([AppPath.MinRPS]);
  }
}
