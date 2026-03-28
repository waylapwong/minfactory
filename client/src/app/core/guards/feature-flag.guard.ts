import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { ENVIRONMENT } from '../../../environments/environment';
import { AppPath } from '../../app.routes';
import { MinFactoryUserService } from '../../features/minfactory/services/minfactory-user.service';
import { MinFactoryRole } from '../../shared/enums/minfactory-role.enum';

function isFeatureEnabled(feature: string): boolean {
  const featureFlags: Record<string, boolean> = {
    minpoker: ENVIRONMENT.FEATURE_FLAGS.MINPOKER,
  };

  return featureFlags[feature] ?? false;
}

export const featureFlagGuard: CanActivateFn = async (route): Promise<boolean | UrlTree> => {
  const router: Router = inject(Router);
  const userService = inject(MinFactoryUserService);
  const feature: string | undefined = route.data?.['feature'];

  if (!feature) {
    return true;
  }

  if (isFeatureEnabled(feature)) {
    return true;
  }

  try {
    await userService.ensureProfileLoaded();
  } catch {
    return router.createUrlTree([AppPath.Root]);
  }

  const userRole: MinFactoryRole | undefined = userService.profileViewModel()?.role;

  // Only real admins may bypass disabled feature flags.
  if (userRole === MinFactoryRole.Admin) {
    return true;
  }

  return router.createUrlTree([AppPath.Root]);
};
