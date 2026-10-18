import { Routes } from '@angular/router';

export enum MinFactoryPath {
  Apps = 'apps',
  Login = 'login',
  Profile = 'profile',
  Register = 'register',
  Root = '',
}

export const MINFACTORY_ROUTES: Routes = [
  {
    path: MinFactoryPath.Root,
    loadComponent: () =>
      import('./pages/minfactory-home/minfactory-home.component').then((m) => m.MinFactoryHomeComponent),
  },
  {
    path: MinFactoryPath.Apps,
    loadComponent: () =>
      import('./pages/minfactory-apps/minfactory-apps.component').then((m) => m.MinFactoryAppsComponent),
  },
  {
    path: MinFactoryPath.Login,
    loadComponent: () =>
      import('./pages/minfactory-login/minfactory-login.component').then((m) => m.MinFactoryLoginComponent),
  },
  {
    path: MinFactoryPath.Profile,
    loadComponent: () =>
      import('./pages/minfactory-profile/minfactory-profile.component').then((m) => m.MinFactoryProfileComponent),
  },
  {
    path: MinFactoryPath.Register,
    loadComponent: () =>
      import('./pages/minfactory-register/minfactory-register.component').then((m) => m.MinFactoryRegisterComponent),
  },
];
