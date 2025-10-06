import { Routes } from '@angular/router';

export enum MinFactoryPath {
  Empty = '',
  MinApps = 'apps',
  MinPlay = 'play',
}

export const MINFACTORY_ROUTES: Routes = [
  {
    path: MinFactoryPath.Empty,
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: MinFactoryPath.MinApps,
    loadComponent: () => import('./pages/apps/apps.component').then((m) => m.AppsComponent),
  },
  {
    path: MinFactoryPath.MinPlay,
    loadComponent: () => import('./pages/play/play.component').then((m) => m.PlayComponent),
  },
];
