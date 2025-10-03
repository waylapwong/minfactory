import { Routes } from '@angular/router';

enum Titles {
  MinFactory = 'minFactory'
}

export enum Paths {
  Root = '',
  Apps = 'apps',
  Games = 'games',
  Home = 'home',
  Any = '**'
}

export const ROUTES: Routes = [
  {
    path: Paths.Root,
    redirectTo: Paths.Home,
    pathMatch: 'full'
  },
  {
    path: Paths.Apps,
    title: Titles.MinFactory,
    loadComponent: () =>
      import('./features/minfactory/pages/apps/apps.component').then((m) => m.AppsComponent)
  },
  {
    path: Paths.Games,
    title: Titles.MinFactory,
    loadComponent: () =>
      import('./features/minfactory/pages/games/games.component').then((m) => m.GamesComponent)
  },
  {
    path: Paths.Home,
    title: Titles.MinFactory,
    loadComponent: () =>
      import('./features/minfactory/pages/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: Paths.Any,
    redirectTo: Paths.Root,
    pathMatch: 'full'
  }
];
