import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree, provideRouter } from '@angular/router';
import { ENVIRONMENT } from '../../../environments/environment';
import { AppPath } from '../../app.routes';
import { MINFACTORY_USER_SERVICE_MOCK } from '../../features/minfactory/mocks/minfactory-user.service.mock';
import { MinFactoryUserService } from '../../features/minfactory/services/minfactory-user.service';
import { MinFactoryRole } from '../../shared/enums/minfactory-role.enum';
import { featureFlagGuard } from './feature-flag.guard';

describe('featureFlagGuard', () => {
  let router: Router;
  let initialMinPokerFlag: boolean;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: MinFactoryUserService, useValue: MINFACTORY_USER_SERVICE_MOCK },
      ],
    });

    router = TestBed.inject(Router);
    initialMinPokerFlag = ENVIRONMENT.FEATURE_FLAGS.MINPOKER;

    MINFACTORY_USER_SERVICE_MOCK.ensureProfileLoaded.calls.reset();
    MINFACTORY_USER_SERVICE_MOCK.loadProfile.calls.reset();
    MINFACTORY_USER_SERVICE_MOCK.clearUserCache.calls.reset();
    MINFACTORY_USER_SERVICE_MOCK.setProfile.calls.reset();
    MINFACTORY_USER_SERVICE_MOCK.setProfile(null);
  });

  afterEach(() => {
    ENVIRONMENT.FEATURE_FLAGS.MINPOKER = initialMinPokerFlag;
  });

  it('should allow route when feature data is missing', async () => {
    const route = { data: {} } as unknown as ActivatedRouteSnapshot;

    await expectAsync(TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never))).toBeResolvedTo(true);
  });

  it('should allow minpoker route when minpoker feature flag is true', async () => {
    ENVIRONMENT.FEATURE_FLAGS.MINPOKER = true;
    const route = { data: { feature: 'minpoker' } } as unknown as ActivatedRouteSnapshot;

    const result = await TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never));

    expect(result).toBe(true);
  });

  it('should redirect minpoker route when minpoker feature flag is false and no role bypass', async () => {
    ENVIRONMENT.FEATURE_FLAGS.MINPOKER = false;
    const route = { data: { feature: 'minpoker' } } as unknown as ActivatedRouteSnapshot;

    const result = await TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never));

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
  });

  it('should allow minpoker route when feature flag is false and current user is Admin', async () => {
    ENVIRONMENT.FEATURE_FLAGS.MINPOKER = false;
    MINFACTORY_USER_SERVICE_MOCK.setProfile({
      createdAt: '19.03.2026, 11:00',
      email: 'admin@example.com',
      role: MinFactoryRole.Admin,
    });
    const route = { data: { feature: 'minpoker' } } as unknown as ActivatedRouteSnapshot;

    const result = await TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never));

    expect(result).toBe(true);
  });

  it('should redirect minpoker route when feature flag is false and current user is not Admin', async () => {
    ENVIRONMENT.FEATURE_FLAGS.MINPOKER = false;
    MINFACTORY_USER_SERVICE_MOCK.setProfile({
      createdAt: '19.03.2026, 11:00',
      email: 'user@example.com',
      role: MinFactoryRole.User,
    });
    const route = { data: { feature: 'minpoker', role: MinFactoryRole.Admin } } as unknown as ActivatedRouteSnapshot;

    const result = await TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never));

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
  });

  it('should load profile when feature is disabled and no profile is cached', async () => {
    ENVIRONMENT.FEATURE_FLAGS.MINPOKER = false;
    const route = { data: { feature: 'minpoker' } } as unknown as ActivatedRouteSnapshot;

    const result = await TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never));

    expect(MINFACTORY_USER_SERVICE_MOCK.ensureProfileLoaded).toHaveBeenCalled();
    expect(result instanceof UrlTree).toBe(true);
  });

  it('should return UrlTree to root when feature is disabled', async () => {
    const route = { data: { feature: 'unknown-feature' } } as unknown as ActivatedRouteSnapshot;

    const result = await TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never));

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
    expect(router.createUrlTree([AppPath.Root])).toEqual(result as UrlTree);
  });

  it('should redirect to root when loading profile fails for disabled feature', async () => {
    ENVIRONMENT.FEATURE_FLAGS.MINPOKER = false;
    MINFACTORY_USER_SERVICE_MOCK.ensureProfileLoaded.and.returnValue(Promise.reject(new Error('load failed')));
    const route = { data: { feature: 'minpoker' } } as unknown as ActivatedRouteSnapshot;

    const result = await TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never));

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/');

    MINFACTORY_USER_SERVICE_MOCK.ensureProfileLoaded.and.callFake(async (): Promise<void> => undefined);
  });
});
