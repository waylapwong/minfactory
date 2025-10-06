import { Routes } from '@angular/router';

export enum MinRPSPath {
  Root = '',
}

export const MINRPS_ROUTES: Routes = [
  {
    path: MinRPSPath.Root,
    loadComponent: () =>
      import('./pages/minrps-menu/minrps-menu.component').then((m) => m.MinRPSMenuComponent),
  },
];
