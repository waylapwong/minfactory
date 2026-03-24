import { Routes } from '@angular/router';
import { leaveGameGuard } from '../../shared/guards/leave-game.guard';

export enum MinPokerPath {
  Root = '',
  Game = 'game',
  Lobby = 'lobby',
}

export const MINPOKER_ROUTES: Routes = [
  {
    path: MinPokerPath.Root,
    loadComponent: () => import('./pages/minpoker-home/minpoker-home.component').then((m) => m.MinPokerHomeComponent),
  },
  {
    path: MinPokerPath.Game,
    canDeactivate: [leaveGameGuard],
    loadComponent: () => import('./pages/minpoker-game/minpoker-game.component').then((m) => m.MinPokerGameComponent),
  },
  {
    path: MinPokerPath.Lobby,
    loadComponent: () =>
      import('./pages/minpoker-lobby/minpoker-lobby.component').then((m) => m.MinPokerLobbyComponent),
  },
];
