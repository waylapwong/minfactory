import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { MinFactoryRole, hasRequiredRole } from '../../shared/enums/minfactory-role.enum';
import { AppPath } from '../../app.routes';
import { MinFactoryUserService } from '../../features/minfactory/services/minfactory-user.service';

export const roleGuard: CanActivateFn = async (route): Promise<boolean | UrlTree> => {
  const userService = inject(MinFactoryUserService);
  const router = inject(Router);

  const requiredRole: MinFactoryRole | undefined = route.data?.['role'];

  if (!requiredRole) {
    return true;
  }

  if (!userService.userProfile()) {
    try {
      await userService.loadProfile();
    } catch {
      return router.createUrlTree([AppPath.Root]);
    }
  }

  const userRole = userService.userProfile()?.role;

  if (userRole && hasRequiredRole(userRole, requiredRole)) {
    return true;
  }

  return router.createUrlTree([AppPath.Root]);
};
