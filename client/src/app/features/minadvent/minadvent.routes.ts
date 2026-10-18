import { Routes } from '@angular/router';
import { authenticationGuard } from '../../core/authentication/guards/authentication.guard';

export enum MinAdventPath {
  Calendar = 'calendars/:id',
  Create = 'calendars/new',
  Root = '',
}

export const MINADVENT_ROUTES: Routes = [
  {
    path: MinAdventPath.Root,
    pathMatch: 'full',
    canActivate: [authenticationGuard],
    loadComponent: () => import('./pages/minadvent-overview/minadvent-overview.component').then((m) => m.MinAdventOverviewComponent),
  },
  {
    path: MinAdventPath.Create,
    canActivate: [authenticationGuard],
    loadComponent: () => import('./pages/minadvent-calendar/minadvent-calendar.component').then((m) => m.MinAdventCalendarComponent),
  },
  {
    path: MinAdventPath.Calendar,
    canActivate: [authenticationGuard],
    loadComponent: () => import('./pages/minadvent-calendar/minadvent-calendar.component').then((m) => m.MinAdventCalendarComponent),
  },
];