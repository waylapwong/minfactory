import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Paths } from '../../app.routes';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {
  constructor(private readonly router: Router) {}

  public navigateToHomePage(): void {
    this.router.navigate([Paths.Home]);
  }
}
