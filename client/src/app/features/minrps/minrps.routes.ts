import { Routes } from '@angular/router';

export const MINRPS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/minrps-menu/minrps-menu.component').then((m) => m.MinRPSMenuComponent),
  },
];
