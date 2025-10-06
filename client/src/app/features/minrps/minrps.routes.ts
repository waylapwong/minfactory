import { Routes } from '@angular/router';

export enum MinRPSPath {
  Game = 'game',
  Root = '',
}

export const MINRPS_ROUTES: Routes = [
  {
    path: MinRPSPath.Root,
    loadComponent: () =>
      import('./pages/minrps-menu/minrps-menu.component').then((m) => m.MinRPSMenuComponent),
  },
  {
    path: MinRPSPath.Game,
    loadComponent: () =>
      import('./pages/minrps-game/minrps-game.component').then((m) => m.MinRPSGameComponent),
  },
];
