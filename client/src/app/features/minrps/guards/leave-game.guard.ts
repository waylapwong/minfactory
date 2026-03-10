import { CanDeactivateFn } from '@angular/router';

export interface CanLeaveGame {
  canDeactivate(): Promise<boolean>;
}

export const leaveGameGuard: CanDeactivateFn<CanLeaveGame> = (component) => {
  return component.canDeactivate();
};
