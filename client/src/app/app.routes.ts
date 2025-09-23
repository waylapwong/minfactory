import { Routes } from '@angular/router';

export enum Paths {
  Root = '',
  Home = 'home',
  Any = '**'
}

enum Titles {
  MinFactory = 'minFactory'
}

export const ROUTES: Routes = [
  {
    path: Paths.Root,
    redirectTo: Paths.Home,
    pathMatch: 'full'
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
