import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { RoutingService } from '../../routing/services/routing.service';
import { AuthenticationService } from '../services/authentication.service';

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
