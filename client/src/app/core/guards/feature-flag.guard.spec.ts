import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree, provideRouter } from '@angular/router';
import { AppPath } from '../../app.routes';
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
    const route = { data: {} } as ActivatedRouteSnapshot;

    expect(TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never))).toBe(true);
  });

  it('should allow minpoker route when minpoker feature is enabled in current environment', () => {
    const route = { data: { feature: 'minpoker' } } as ActivatedRouteSnapshot;

    expect(TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never))).toBe(true);
  });

  it('should return UrlTree to root when feature is disabled', () => {
    const route = { data: { feature: 'unknown-feature' } } as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() => featureFlagGuard(route, {} as never));

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
    expect(router.createUrlTree([AppPath.Root])).toEqual(result as UrlTree);
  });
});
