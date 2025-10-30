import { Routes } from '@angular/router';

export enum MinRpsPath {
  Root = '',
  Game = 'game',
  Lobby = 'lobby',
  Multiplayer = 'multiplayer',
}

export const MINRPS_ROUTES: Routes = [
  {
    path: MinRpsPath.Root,
    loadComponent: () =>
      import('./pages/minrps-home/minrps-home.component').then((m) => m.MinRpsHomeComponent),
  },
  {
    path: MinRpsPath.Game,
    loadComponent: () =>
      import('./pages/minrps-game/minrps-game.component').then((m) => m.MinRpsGameComponent),
  },
  {
    path: MinRpsPath.Lobby,
    loadComponent: () =>
      import('./pages/minrps-lobby/minrps-lobby.component').then((m) => m.MinRpsLobbyComponent),
  },
  {
    path: `${MinRpsPath.Multiplayer}/:id`,
    loadComponent: () =>
      import('./pages/minrps-multiplayer/minrps-multiplayer.component').then(
        (m) => m.MinRpsMultiplayerComponent,
      ),
  },
];
