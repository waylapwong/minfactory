import { Routes } from '@angular/router';

enum Title {
  MinFactory = 'minFactory'
}

export enum Path {
  Root = '',
  Apps = 'apps',
  Home = 'home',
  MinRPS = 'minrps',
  Play = 'play',
  Any = '**'
}

export const APP_ROUTES: Routes = [
  {
    path: Path.Root,
    redirectTo: Path.Home,
    pathMatch: 'full'
  },
  {
    path: Path.Apps,
    title: Title.MinFactory,
    loadComponent: () =>
      import('./features/minfactory/pages/apps/apps.component').then((m) => m.AppsComponent)
  },
  {
    path: Path.Play,
    title: Title.MinFactory,
    loadComponent: () =>
      import('./features/minfactory/pages/play/play.component').then((m) => m.PlayComponent)
  },
  {
    path: Path.Home,
    title: Title.MinFactory,
    loadComponent: () =>
      import('./features/minfactory/pages/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: Path.MinRPS,
    loadChildren: () => import('./features/minrps/minrps.routes').then((m) => m.MINRPS_ROUTES),
    loadComponent: () => import('./features/minrps/minrps.component').then((m) => m.MinRPSComponent)
  },
  {
    path: Path.Any,
    redirectTo: Path.Root,
    pathMatch: 'full'
  }
];
