import { Injectable } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class MinFactoryLogoutService {
  constructor(private readonly authService: AuthService) {}

  public async logoutUser(): Promise<void> {
    await this.authService.signOut();
  }
}
