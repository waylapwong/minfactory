import { Routes } from '@angular/router';

export enum MinFactoryPath {
  MinApps = 'apps',
  MinPlay = 'play',
  Root = '',
}

export const MINFACTORY_ROUTES: Routes = [
  {
    path: MinFactoryPath.Root,
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
