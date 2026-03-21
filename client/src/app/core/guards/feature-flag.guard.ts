import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { ENVIRONMENT } from '../../../environments/environment';
import { AppPath } from '../../app.routes';

function isFeatureEnabled(feature: string): boolean {
  const featureFlags: Record<string, boolean> = {
    minpoker: ENVIRONMENT.FEATURE_FLAGS.MINPOKER,
  };

  return featureFlags[feature] ?? false;
}

export const featureFlagGuard: CanActivateFn = (route): boolean | UrlTree => {
  const router: Router = inject(Router);
  const feature: string | undefined = route.data?.['feature'];

  if (!feature) {
    return true;
  }

  return isFeatureEnabled(feature) ? true : router.createUrlTree([AppPath.Root]);
};
