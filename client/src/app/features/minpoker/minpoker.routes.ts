import { Routes } from '@angular/router';
import { leaveGameGuard } from '../../shared/guards/leave-game.guard';

export enum MinPokerPath {
  Root = '',
  Game = 'game',
  MyGames = 'my-games',
  PublicGames = 'public-games',
}

export const MINPOKER_ROUTES: Routes = [
  {
    path: MinPokerPath.Root,
    loadComponent: () => import('./pages/minpoker-home/minpoker-home.component').then((m) => m.MinPokerHomeComponent),
  },
  {
    path: `${MinPokerPath.Game}/:id`,
    canDeactivate: [leaveGameGuard],
    loadComponent: () => import('./pages/minpoker-game/minpoker-game.component').then((m) => m.MinPokerGameComponent),
  },
  {
    path: MinPokerPath.MyGames,
    loadComponent: () => import('./pages/minpoker-my-games/minpoker-my-games.component').then((m) => m.MinPokerMyGamesComponent),
  },
  {
    path: MinPokerPath.PublicGames,
    loadComponent: () => import('./pages/minpoker-public-games/minpoker-public-games.component').then((m) => m.MinPokerPublicGamesComponent),
  },
];
