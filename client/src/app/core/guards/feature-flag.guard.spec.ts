import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree, provideRouter } from '@angular/router';
import { ENVIRONMENT } from '../../../environments/environment';
import { AppPath } from '../../app.routes';
import { featureFlagGuard } from './feature-flag.guard';

describe('featureFlagGuard', () => {
  let router: Router;
  let initialMinPokerFlag: boolean;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });

    router = TestBed.inject(Router);
    initialMinPokerFlag = ENVIRONMENT.FEATURE_FLAGS.MINPOKER;
  });

  afterEach(() => {
    ENVIRONMENT.FEATURE_FLAGS.MINPOKER = initialMinPokerFlag;
  });

  it('should allow route when feature data is missing', () => {
    const route = { data: {} } as unknown as ActivatedRouteSnapshot;

    expect(TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never))).toBe(true);
  });

  it('should allow minpoker route when minpoker feature flag is true', () => {
    ENVIRONMENT.FEATURE_FLAGS.MINPOKER = true;
    const route = { data: { feature: 'minpoker' } } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never));

    expect(result).toBe(true);
  });

  it('should redirect minpoker route when minpoker feature flag is false', () => {
    ENVIRONMENT.FEATURE_FLAGS.MINPOKER = false;
    const route = { data: { feature: 'minpoker' } } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never));

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
  });

  it('should return UrlTree to root when feature is disabled', () => {
    const route = { data: { feature: 'unknown-feature' } } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never));

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
    expect(router.createUrlTree([AppPath.Root])).toEqual(result as UrlTree);
  });
});
