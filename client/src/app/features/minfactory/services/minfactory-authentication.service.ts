import { Injectable } from '@angular/core';
import { AuthenticationService } from '../../../core/authentication/authentication.service';
import { MinFactoryUserDto } from '../../../core/generated';
import { MinFactoryDtoMapper } from '../mapper/minfactory-dto.mapper';
import { MinFactoryUser } from '../models/domains/minfactory-user';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';

@Injectable({
  providedIn: 'root',
})
export class MinFactoryAuthenticationService {
  private readonly EMAIL_ALREADY_IN_USE_ERROR = 'Diese E-Mail-Adresse wird bereits verwendet.';

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly userRepository: MinFactoryUserRepository,
  ) {}

  public async loginUser(email: string, password: string): Promise<MinFactoryUser> {
    await this.authenticationService.loginWithEmailAndPassword(email, password);
    const userDto = await this.userRepository.getMe();
    return MinFactoryDtoMapper.userDtoToDomain(userDto);
  }

  public async logoutUser(): Promise<void> {
    await this.authenticationService.signOut();
  }

  public async registerUser(email: string, password: string): Promise<MinFactoryUser> {
    try {
      await this.authenticationService.registerWithEmailAndPassword(email, password);
    } catch (error) {
      if (!this.canContinueWithExistingFirebaseUser(error, email)) {
        throw error;
      }
    }
    await this.ensureRegistrationToken();
    const userDto: MinFactoryUserDto = await this.userRepository.createUser();
    return MinFactoryDtoMapper.userDtoToDomain(userDto);
  }

  private canContinueWithExistingFirebaseUser(error: unknown, email: string): boolean {
    if (!(error instanceof Error) || error.message !== this.EMAIL_ALREADY_IN_USE_ERROR) {
      return false;
    }
    const currentUserEmail = this.authenticationService.currentUser()?.email?.toLowerCase() ?? '';
    return currentUserEmail === email.toLowerCase();
  }

  private async ensureRegistrationToken(): Promise<void> {
    const idToken: string | null = await this.authenticationService.getIdToken(true);
    if (!idToken) {
      throw new Error('Konto erstellt, aber keine gueltige Session vorhanden. Bitte erneut versuchen.');
    }
  }
}
