import { Routes } from '@angular/router';

export enum MinFactoryPath {
  Apps = 'apps',
  Register = 'register',
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
  {
    path: MinFactoryPath.Register,
    loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent),
  },
];
