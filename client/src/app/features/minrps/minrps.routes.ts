import { Routes } from '@angular/router';
import { leaveGameGuard } from '../../shared/guards/leave-game.guard';

export enum MinRpsPath {
  Root = '',
  Multiplayer = 'multiplayer',
  Overview = 'overview',
  Singleplayer = 'singleplayer',
}

export const MINRPS_ROUTES: Routes = [
  {
    path: MinRpsPath.Root,
    loadComponent: () => import('./pages/minrps-home/minrps-home.component').then((m) => m.MinRpsHomeComponent),
  },
  {
    path: `${MinRpsPath.Multiplayer}/:id`,
    canDeactivate: [leaveGameGuard],
    loadComponent: () =>
      import('./pages/minrps-multiplayer/minrps-multiplayer.component').then((m) => m.MinRpsMultiplayerComponent),
  },
  {
    path: MinRpsPath.Overview,
    loadComponent: () =>
      import('./pages/minrps-overview/minrps-overview.component').then((m) => m.MinRpsOverviewComponent),
  },
  {
    path: MinRpsPath.Singleplayer,
    canDeactivate: [leaveGameGuard],
    loadComponent: () =>
      import('./pages/minrps-singleplayer/minrps-singleplayer.component').then((m) => m.MinRpsSingleplayerComponent),
  },
];
