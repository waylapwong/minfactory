import { Routes } from '@angular/router';
import { leaveGameGuard } from './guards/leave-game.guard';

export enum MinPokerPath {
  Root = '',
  Game = 'game',
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
];
