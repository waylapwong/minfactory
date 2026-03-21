import { Injectable } from '@angular/core';
import { AuthenticationService } from '../../../core/authentication/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class MinFactoryLogoutService {
  constructor(private readonly authService: AuthenticationService) {}

  public async logoutUser(): Promise<void> {
    await this.authService.signOut();
  }
}
