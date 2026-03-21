import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from '../../../core/authentication/authentication.service';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { MINFACTORY_USER_REPOSITORY_MOCK } from '../repositories/minfactory-user.repository.mock';
import { MINFACTORY_AUTHENTICATION_SERVICE_MOCK } from './minfactory-authentication.service.mock';
import { MinFactoryLoginService } from './minfactory-login.service';

describe('MinFactoryLoginService', () => {
  let service: MinFactoryLoginService;

  beforeEach(() => {
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.loginWithEmailAndPassword.calls.reset();
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.loginWithEmailAndPassword.and.resolveTo();
    MINFACTORY_USER_REPOSITORY_MOCK.getMe.calls.reset();
    MINFACTORY_USER_REPOSITORY_MOCK.getMe.and.callFake(async () => ({
      createdAt: '2026-03-19T10:00:00.000Z',
      email: 'user@example.com',
    }));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinFactoryLoginService,
        { provide: AuthenticationService, useValue: MINFACTORY_AUTHENTICATION_SERVICE_MOCK },
        { provide: MinFactoryUserRepository, useValue: MINFACTORY_USER_REPOSITORY_MOCK },
      ],
    });

    service = TestBed.inject(MinFactoryLoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loginUser()', () => {
    it('should login with firebase and then fetch minfactory user', async () => {
      const result = await service.loginUser('user@example.com', 'password123');

      expect(MINFACTORY_AUTHENTICATION_SERVICE_MOCK.loginWithEmailAndPassword).toHaveBeenCalledWith(
        'user@example.com',
        'password123',
      );
      expect(MINFACTORY_USER_REPOSITORY_MOCK.getMe).toHaveBeenCalled();
      expect(result.email).toBe('user@example.com');
      expect(result.createdAt).toEqual(new Date('2026-03-19T10:00:00.000Z'));
    });

    it('should not fetch minfactory user when firebase login fails', async () => {
      MINFACTORY_AUTHENTICATION_SERVICE_MOCK.loginWithEmailAndPassword.and.returnValue(
        Promise.reject(new Error('Ungültige Anmeldedaten.')),
      );

      await expectAsync(service.loginUser('user@example.com', 'wrongpassword')).toBeRejectedWithError(
        'Ungültige Anmeldedaten.',
      );
      expect(MINFACTORY_USER_REPOSITORY_MOCK.getMe).not.toHaveBeenCalled();
    });

    it('should throw error when fetching user fails', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.getMe.and.returnValue(Promise.reject(new Error('Benutzer nicht gefunden.')));

      await expectAsync(service.loginUser('user@example.com', 'password123')).toBeRejectedWithError(
        'Benutzer nicht gefunden.',
      );
    });
  });
});
