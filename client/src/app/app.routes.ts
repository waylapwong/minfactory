import { Routes } from '@angular/router';

import { AppName } from './shared/enums/app-name.enum';

export enum AppPath {
  MinRPS = 'minrps',
  Root = '',
  Unknown = '**',
}

export const APP_ROUTES: Routes = [
  {
    path: AppPath.Root,
    title: AppName.MinFactory,
    loadChildren: () =>
      import('./features/minfactory/minfactory.routes').then((m) => m.MINFACTORY_ROUTES),
    loadComponent: () =>
      import('./features/minfactory/minfactory.component').then((m) => m.MinFactoryComponent),
  },
  {
    path: AppPath.MinRPS,
    title: AppName.MinRPS,
    loadChildren: () => import('./features/minrps/minrps.routes').then((m) => m.MINRPS_ROUTES),
    loadComponent: () =>
      import('./features/minrps/minrps.component').then((m) => m.MinRPSComponent),
  },
  {
    path: AppPath.Unknown,
    redirectTo: AppPath.Root,
    pathMatch: 'full',
  },
];
