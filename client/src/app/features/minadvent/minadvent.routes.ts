import { Routes } from '@angular/router';
import { authenticationGuard } from '../../core/authentication/guards/authentication.guard';
import { roleGuard } from '../../core/authorization/guards/role.guard';
import { leaveGameGuard } from '../../shared/guards/leave-game.guard';
import { MinFactoryRole } from '../../shared/enums/minfactory-role.enum';

export enum MinAdventPath {
  Calendar = 'calendars/:id',
  Create = 'calendars/new',
  Root = '',
  Shared = 'shared/:token',
}

export const MINADVENT_ROUTES: Routes = [
  {
    path: MinAdventPath.Shared,
    loadComponent: () =>
      import('./pages/minadvent-shared-calendar/minadvent-shared-calendar.component').then(
        (m) => m.MinAdventSharedCalendarComponent,
      ),
  },
  {
    path: MinAdventPath.Root,
    pathMatch: 'full',
    canActivate: [authenticationGuard, roleGuard],
    data: { role: MinFactoryRole.Admin },
    loadComponent: () =>
      import('./pages/minadvent-overview/minadvent-overview.component').then((m) => m.MinAdventOverviewComponent),
  },
  {
    path: MinAdventPath.Create,
    pathMatch: 'full',
    redirectTo: MinAdventPath.Root,
  },
  {
    path: MinAdventPath.Calendar,
    canActivate: [authenticationGuard, roleGuard],
    canDeactivate: [leaveGameGuard],
    data: { role: MinFactoryRole.Admin },
    loadComponent: () =>
      import('./pages/minadvent-calendar/minadvent-calendar.component').then((m) => m.MinAdventCalendarComponent),
  },
];
