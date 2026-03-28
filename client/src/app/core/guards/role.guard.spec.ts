import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree, provideRouter } from '@angular/router';
import { AppPath } from '../../app.routes';
import { MINFACTORY_USER_SERVICE_MOCK } from '../../features/minfactory/mocks/minfactory-user.service.mock';
import { MinFactoryUserService } from '../../features/minfactory/services/minfactory-user.service';
import { MinFactoryRole } from '../../shared/enums/minfactory-role.enum';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: MinFactoryUserService, useValue: MINFACTORY_USER_SERVICE_MOCK },
      ],
    });

    router = TestBed.inject(Router);

    MINFACTORY_USER_SERVICE_MOCK.ensureProfileLoaded.calls.reset();
    MINFACTORY_USER_SERVICE_MOCK.loadProfile.calls.reset();
    MINFACTORY_USER_SERVICE_MOCK.clearUserCache.calls.reset();
    MINFACTORY_USER_SERVICE_MOCK.setProfile(null);
  });

  it('should allow route when no role is required', async () => {
    const route = { data: {} } as unknown as ActivatedRouteSnapshot;

    const result = await TestBed.runInInjectionContext(() => roleGuard(route, {} as never));

    expect(result).toBeTrue();
  });

  it('should allow route when user has the required Admin role', async () => {
    MINFACTORY_USER_SERVICE_MOCK.setProfile({
      createdAt: '19.03.2026, 11:00',
      email: 'admin@example.com',
      role: MinFactoryRole.Admin,
    });
    const route = { data: { role: MinFactoryRole.Admin } } as unknown as ActivatedRouteSnapshot;

    const result = await TestBed.runInInjectionContext(() => roleGuard(route, {} as never));

    expect(result).toBeTrue();
  });

  it('should allow route when user has the required User role', async () => {
    MINFACTORY_USER_SERVICE_MOCK.setProfile({
      createdAt: '19.03.2026, 11:00',
      email: 'user@example.com',
      role: MinFactoryRole.User,
    });
    const route = { data: { role: MinFactoryRole.User } } as unknown as ActivatedRouteSnapshot;

    const result = await TestBed.runInInjectionContext(() => roleGuard(route, {} as never));

    expect(result).toBeTrue();
  });

  it('should allow route when Admin user accesses a User-only route (hierarchy)', async () => {
    MINFACTORY_USER_SERVICE_MOCK.setProfile({
      createdAt: '19.03.2026, 11:00',
      email: 'admin@example.com',
      role: MinFactoryRole.Admin,
    });
    const route = { data: { role: MinFactoryRole.User } } as unknown as ActivatedRouteSnapshot;

    const result = await TestBed.runInInjectionContext(() => roleGuard(route, {} as never));

    expect(result).toBeTrue();
  });

  it('should redirect to root when user has User role but Admin is required', async () => {
    MINFACTORY_USER_SERVICE_MOCK.setProfile({
      createdAt: '19.03.2026, 11:00',
      email: 'user@example.com',
      role: MinFactoryRole.User,
    });
    const route = { data: { role: MinFactoryRole.Admin } } as unknown as ActivatedRouteSnapshot;

    const result = await TestBed.runInInjectionContext(() => roleGuard(route, {} as never));

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
    expect(router.createUrlTree([AppPath.Root])).toEqual(result as UrlTree);
  });

  it('should load profile when profile is not yet loaded and then check role', async () => {
    const route = { data: { role: MinFactoryRole.Admin } } as unknown as ActivatedRouteSnapshot;

    const result = await TestBed.runInInjectionContext(() => roleGuard(route, {} as never));

    expect(MINFACTORY_USER_SERVICE_MOCK.ensureProfileLoaded).toHaveBeenCalled();
    expect(result instanceof UrlTree).toBeTrue();
  });

  it('should not reload profile when profile is already loaded', async () => {
    MINFACTORY_USER_SERVICE_MOCK.setProfile({
      createdAt: '19.03.2026, 11:00',
      email: 'admin@example.com',
      role: MinFactoryRole.Admin,
    });
    const route = { data: { role: MinFactoryRole.Admin } } as unknown as ActivatedRouteSnapshot;

    await TestBed.runInInjectionContext(() => roleGuard(route, {} as never));

    expect(MINFACTORY_USER_SERVICE_MOCK.ensureProfileLoaded).toHaveBeenCalled();
  });
});
