import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AppPath } from '../../app.routes';
import { MinFactoryUserService } from '../../features/minfactory/services/minfactory-user.service';
import { MinFactoryRole, hasRequiredRole } from '../../shared/enums/minfactory-role.enum';

export const roleGuard: CanActivateFn = async (route): Promise<boolean | UrlTree> => {
  const userService = inject(MinFactoryUserService);
  const router = inject(Router);

  const requiredRole: MinFactoryRole | undefined = route.data?.['role'];

  if (!requiredRole) {
    return true;
  }

  try {
    await userService.ensureProfileLoaded();
  } catch {
    return router.createUrlTree([AppPath.Root]);
  }

  const userRole = userService.profileViewModel()?.role;

  if (userRole && hasRequiredRole(userRole, requiredRole)) {
    return true;
  }

  return router.createUrlTree([AppPath.Root]);
};
