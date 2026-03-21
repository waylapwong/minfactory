import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree, provideRouter } from '@angular/router';
import { AppPath } from '../../app.routes';
import { ENVIRONMENT } from '../../../environments/environment';
import { featureFlagGuard } from './feature-flag.guard';

describe('featureFlagGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });

    router = TestBed.inject(Router);
  });

  it('should allow route when feature data is missing', () => {
    const route = { data: {} } as unknown as ActivatedRouteSnapshot;

    expect(TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never))).toBe(true);
  });

  it('should evaluate minpoker route based on current environment flag', () => {
    const route = { data: { feature: 'minpoker' } } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never));

    if (ENVIRONMENT.FEATURE_FLAGS.MINPOKER) {
      expect(result).toBe(true);
    } else {
      expect(result instanceof UrlTree).toBe(true);
      expect(router.serializeUrl(result as UrlTree)).toBe('/');
    }
  });

  it('should return UrlTree to root when feature is disabled', () => {
    const route = { data: { feature: 'unknown-feature' } } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never));

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
    expect(router.createUrlTree([AppPath.Root])).toEqual(result as UrlTree);
  });
});
