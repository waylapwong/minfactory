import { Routes } from '@angular/router';
import { authenticationGuard } from './core/guards/authentication.guard';
import { featureFlagGuard } from './core/guards/feature-flag.guard';
import { AppName } from './shared/enums/app-name.enum';

export enum AppPath {
  MinPoker = 'minpoker',
  MinRps = 'minrps',
  Root = '',
  Unknown = '**',
}

export const APP_ROUTES: Routes = [
  {
    path: AppPath.Root,
    title: AppName.MinFactory,
    loadChildren: () => import('./features/minfactory/minfactory.routes').then((m) => m.MINFACTORY_ROUTES),
    loadComponent: () => import('./features/minfactory/minfactory.component').then((m) => m.MinFactoryComponent),
  },
  {
    path: AppPath.MinPoker,
    title: AppName.MinPoker,
    canActivate: [featureFlagGuard, authenticationGuard],
    data: { feature: 'minpoker' },
    loadChildren: () => import('./features/minpoker/minpoker.routes').then((m) => m.MINPOKER_ROUTES),
    loadComponent: () => import('./features/minpoker/minpoker.component').then((m) => m.MinPokerComponent),
  },
  {
    path: AppPath.MinRps,
    title: AppName.MinRps,
    loadChildren: () => import('./features/minrps/minrps.routes').then((m) => m.MINRPS_ROUTES),
    loadComponent: () => import('./features/minrps/minrps.component').then((m) => m.MinRpsComponent),
  },
  {
    path: AppPath.Unknown,
    redirectTo: AppPath.Root,
    pathMatch: 'full',
  },
];
