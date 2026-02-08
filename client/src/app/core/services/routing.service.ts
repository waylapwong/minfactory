import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppPath } from '../../app.routes';
import { MinRpsPath } from '../../features/minrps/minrps.routes';

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  constructor(private readonly router: Router) {}

  public navigateToHomePage(): void {
    this.router.navigate([AppPath.Root]);
  }

  public navigateToMinRps(): void {
    this.router.navigate([AppPath.MinRps]);
  }

  public navigateToMinRpsGame(): void {
    this.router.navigate([AppPath.MinRps, MinRpsPath.Game]);
  }

  public navigateToMinRpsLobby(): void {
    this.router.navigate([AppPath.MinRps, MinRpsPath.Lobby]);
  }

  public navigateToMinRpsMultiplayer(id: string): void {
    this.router.navigate([AppPath.MinRps, MinRpsPath.Multiplayer, id]);
  }
}
