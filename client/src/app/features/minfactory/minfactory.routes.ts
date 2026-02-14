import { Routes } from '@angular/router';

export enum MinFactoryPath {
  Apps = 'apps',
  Root = '',
}

export const MINFACTORY_ROUTES: Routes = [
  {
    path: MinFactoryPath.Root,
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: MinFactoryPath.Apps,
    loadComponent: () => import('./pages/apps/apps.component').then((m) => m.AppsComponent),
  },
];
