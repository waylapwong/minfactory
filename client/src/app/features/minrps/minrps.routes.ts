import { Routes } from '@angular/router';

export enum MinRPSPath {
  Root = '',
  Game = 'game',
  Lobby = 'lobby',
  Multiplayer = 'multiplayer',
}

export const MINRPS_ROUTES: Routes = [
  {
    path: MinRPSPath.Root,
    loadComponent: () =>
      import('./pages/minrps-home/minrps-home.component').then((m) => m.MinRPSHomeComponent),
  },
  {
    path: MinRPSPath.Game,
    loadComponent: () =>
      import('./pages/minrps-game/minrps-game.component').then((m) => m.MinRPSGameComponent),
  },
  {
    path: MinRPSPath.Lobby,
    loadComponent: () =>
      import('./pages/minrps-lobby/minrps-lobby.component').then((m) => m.MinRPSLobbyComponent),
  },
  {
    path: `${MinRPSPath.Multiplayer}/:id`,
    loadComponent: () =>
      import('./pages/minrps-multiplayer/minrps-multiplayer.component').then(
        (m) => m.MinRPSMultiplayerComponent,
      ),
  },
];
