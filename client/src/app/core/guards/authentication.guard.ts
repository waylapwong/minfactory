import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { RoutingService } from '../routing/routing.service';

export const authenticationGuard: CanActivateFn = async () => {
  const authenticationService = inject(AuthenticationService);
  const routingService = inject(RoutingService);

  const idToken = await authenticationService.getIdToken();

  if (idToken) {
    return true;
  }

  routingService.navigateToLogin();
  return false;
};
