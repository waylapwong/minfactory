import { Routes } from '@angular/router';

import { AppName } from './shared/enums/app-name.enum';

export enum Path {
  Empty = '',
  Apps = 'apps',
  Home = 'home',
  MinRPS = 'minrps',
  Play = 'play',
  Any = '**',
}

export const APP_ROUTES: Routes = [
  {
    path: Path.Empty,
    title: AppName.MinFactory,
    loadChildren: () =>
      import('./features/minfactory/minfactory.routes').then((m) => m.MINFACTORY_ROUTES),
    loadComponent: () =>
      import('./features/minfactory/minfactory.component').then((m) => m.MinFactoryComponent),
  },
  {
    path: Path.MinRPS,
    title: AppName.MinRPS,
    loadChildren: () => import('./features/minrps/minrps.routes').then((m) => m.MINRPS_ROUTES),
    loadComponent: () =>
      import('./features/minrps/minrps.component').then((m) => m.MinRPSComponent),
  },
  {
    path: Path.Any,
    redirectTo: Path.Empty,
    pathMatch: 'full',
  },
];
