import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppPath } from '../../app.routes';
import { MinFactoryPath } from '../../features/minfactory/minfactory.routes';
import { MinRpsPath } from '../../features/minrps/minrps.routes';

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  constructor(private readonly router: Router) {}

  public navigateToApps(): void {
    this.router.navigate([AppPath.Root, MinFactoryPath.Apps]);
  }

  public navigateToLogin(): void {
    this.router.navigate([AppPath.Root, MinFactoryPath.Login]);
  }

  public navigateToRegister(): void {
    this.router.navigate([AppPath.Root, MinFactoryPath.Register]);
  }

  public navigateToHomePage(): void {
    this.router.navigate([AppPath.Root]);
  }

  public navigateToMinRps(): void {
    this.router.navigate([AppPath.MinRps]);
  }

  public navigateToMinRpsMultiplayer(id: string): void {
    this.router.navigate([AppPath.MinRps, MinRpsPath.Multiplayer, id]);
  }

  public navigateToMinRpsOverview(): void {
    this.router.navigate([AppPath.MinRps, MinRpsPath.Overview]);
  }

  public navigateToMinRpsSingleplayer(): void {
    this.router.navigate([AppPath.MinRps, MinRpsPath.Singleplayer]);
  }
}
