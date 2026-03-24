import { CanDeactivateFn, UrlTree } from '@angular/router';

export interface CanLeaveGame {
  canDeactivate(): boolean | UrlTree | Promise<boolean | UrlTree>;
}

export const leaveGameGuard: CanDeactivateFn<CanLeaveGame> = (component) => {
  return component.canDeactivate();
};
