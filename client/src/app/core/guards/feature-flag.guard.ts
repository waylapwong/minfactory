import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { ENVIRONMENT } from '../../../environments/environment';
import { AppPath } from '../../app.routes';
import { MinFactoryRole } from '../../shared/enums/minfactory-role.enum';

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

  if (isFeatureEnabled(feature)) {
    return true;
  }

  // Admin role bypasses the feature flag restriction
  if (route.data?.['role'] === MinFactoryRole.Admin) {
    return true;
  }

  return router.createUrlTree([AppPath.Root]);
};
