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

  public navigateToHomePage(): void {
    this.router.navigate([AppPath.Root]);
  }

  public navigateToApps(): void {
    this.router.navigate([AppPath.Root, MinFactoryPath.Apps]);
  }

  public navigateToMinRps(): void {
    this.router.navigate([AppPath.MinRps]);
  }

  public navigateToMinRpsSingleplayer(): void {
    this.router.navigate([AppPath.MinRps, MinRpsPath.Singleplayer]);
  }

  public navigateToMinRpsOverview(): void {
    this.router.navigate([AppPath.MinRps, MinRpsPath.Overview]);
  }

  public navigateToMinRpsMultiplayer(id: string): void {
    this.router.navigate([AppPath.MinRps, MinRpsPath.Multiplayer, id]);
  }
}
