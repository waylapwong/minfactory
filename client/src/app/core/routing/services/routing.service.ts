import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppPath } from '../../../app.routes';
import { MinFactoryPath } from '../../../features/minfactory/minfactory.routes';
import { MinPokerPath } from '../../../features/minpoker/minpoker.routes';
import { MinRpsPath } from '../../../features/minrps/minrps.routes';

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  constructor(private readonly router: Router) {}

  public navigateToApps(): void {
    this.router.navigate([AppPath.Root, MinFactoryPath.Apps]);
  }

  public navigateToHomePage(): void {
    void this.router.navigate([AppPath.Root]);
  }

  public navigateToLogin(): void {
    void this.router.navigate([AppPath.Root, MinFactoryPath.Login]);
  }

  public navigateToMinPoker(): void {
    this.router.navigate([AppPath.MinPoker]);
  }

  public navigateToMinAdvent(): void {
    void this.router.navigate([AppPath.MinAdvent]);
  }

  public navigateToMinAdventCalendar(id: string): void {
    void this.router.navigate([AppPath.MinAdvent, 'calendars', id]);
  }

  public navigateToMinAdventCreate(): void {
    void this.router.navigate([AppPath.MinAdvent, 'calendars', 'new']);
  }

  public navigateToMinPokerGame(id: string): void {
    void this.router.navigate([AppPath.MinPoker, MinPokerPath.Game, id]);
  }

  public navigateToMinPokerMyGames(): void {
    void this.router.navigate([AppPath.MinPoker, MinPokerPath.MyGames]);
  }

  public navigateToMinPokerPublicGames(): void {
    void this.router.navigate([AppPath.MinPoker, MinPokerPath.PublicGames]);
  }

  public navigateToMinRps(): void {
    void this.router.navigate([AppPath.MinRps]);
  }

  public navigateToMinRpsMultiplayer(id: string): void {
    void this.router.navigate([AppPath.MinRps, MinRpsPath.Multiplayer, id]);
  }

  public navigateToMinRpsOverview(): void {
    void this.router.navigate([AppPath.MinRps, MinRpsPath.Overview]);
  }

  public navigateToMinRpsSingleplayer(): void {
    void this.router.navigate([AppPath.MinRps, MinRpsPath.Singleplayer]);
  }

  public navigateToProfile(): void {
    void this.router.navigate([AppPath.Root, MinFactoryPath.Profile]);
  }

  public navigateToRegister(): void {
    void this.router.navigate([AppPath.Root, MinFactoryPath.Register]);
  }
}
