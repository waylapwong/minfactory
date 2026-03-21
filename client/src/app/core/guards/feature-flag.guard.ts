import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { ENVIRONMENT } from '../../../environments/environment';
import { AppPath } from '../../app.routes';

const FEATURE_FLAGS: Record<string, boolean> = {
  minpoker: ENVIRONMENT.FEATURE_FLAGS.MINPOKER,
};

export const featureFlagGuard: CanActivateFn = (route): boolean | UrlTree => {
  const router: Router = inject(Router);
  const feature: string | undefined = route.data?.['feature'];

  if (!feature) {
    return true;
  }

  return FEATURE_FLAGS[feature] ? true : router.createUrlTree([AppPath.Root]);
};