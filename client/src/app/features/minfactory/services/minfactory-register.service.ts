import { Injectable } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { MinFactoryDtoMapper } from '../mapper/minfactory-dto.mapper';
import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';

@Injectable({
  providedIn: 'root',
})
export class MinFactoryRegisterService {
  private readonly EMAIL_ALREADY_IN_USE_ERROR = 'Diese E-Mail-Adresse wird bereits verwendet.';

  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: MinFactoryUserRepository,
  ) {}

  public async registerUser(email: string, password: string): Promise<MinFactoryUser> {
    try {
      await this.authService.registerWithEmailAndPassword(email, password);
    } catch (error) {
      if (!this.canContinueWithExistingFirebaseUser(error, email)) {
        throw error;
      }
    }

    await this.ensureRegistrationToken();

    const userDto = await this.userRepository.createUser();

    return MinFactoryDtoMapper.userDtoToDomain(userDto);
  }

  private canContinueWithExistingFirebaseUser(error: unknown, email: string): boolean {
    if (!(error instanceof Error) || error.message !== this.EMAIL_ALREADY_IN_USE_ERROR) {
      return false;
    }

    const currentUserEmail = this.authService.currentUser()?.email?.toLowerCase() ?? '';

    return currentUserEmail === email.toLowerCase();
  }

  private async ensureRegistrationToken(): Promise<void> {
    const idToken: string | null = await this.authService.getIdToken(true);

    if (!idToken) {
      throw new Error('Konto erstellt, aber keine gueltige Session vorhanden. Bitte erneut versuchen.');
    }
  }
}
