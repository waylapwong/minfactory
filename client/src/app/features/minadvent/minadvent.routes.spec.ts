import { Route } from '@angular/router';
import { MINADVENT_ROUTES, MinAdventPath } from './minadvent.routes';

describe('MINADVENT_ROUTES', () => {
  it('allows anonymous access to the shared calendar route', () => {
    const sharedRoute: Route | undefined = MINADVENT_ROUTES.find((route) => route.path === MinAdventPath.Shared);

    expect(sharedRoute).toBeDefined();
    expect(sharedRoute?.canActivate).toBeUndefined();
  });

  it('protects private calendar routes with authentication and the admin role', () => {
    const privateRoutes: Route[] = MINADVENT_ROUTES.filter(
      (route) => route.path === MinAdventPath.Root || route.path === MinAdventPath.Calendar,
    );

    expect(privateRoutes).toHaveSize(2);
    privateRoutes.forEach((route: Route) => {
      expect(route.canActivate).toHaveSize(2);
      expect(route.data?.['role']).toBe('admin');
    });
  });
});
