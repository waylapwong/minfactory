import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from '../../../core/authentication/authentication.service';
import { AUTHENTICATION_SERVICE_MOCK } from '../../../core/mocks/authentication.service.mock';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { MINFACTORY_USER_REPOSITORY_MOCK } from '../mocks/minfactory-user.repository.mock';
import { MinFactoryAuthenticationService } from './minfactory-authentication.service';

describe('MinFactoryAuthenticationService', () => {
  let service: MinFactoryAuthenticationService;

  beforeEach(() => {
    AUTHENTICATION_SERVICE_MOCK.loginWithEmailAndPassword.calls.reset();
    AUTHENTICATION_SERVICE_MOCK.loginWithEmailAndPassword.and.resolveTo();
    AUTHENTICATION_SERVICE_MOCK.registerWithEmailAndPassword.calls.reset();
    AUTHENTICATION_SERVICE_MOCK.registerWithEmailAndPassword.and.resolveTo();
    AUTHENTICATION_SERVICE_MOCK.signOut.calls.reset();
    AUTHENTICATION_SERVICE_MOCK.signOut.and.resolveTo();
    AUTHENTICATION_SERVICE_MOCK.getIdToken.calls.reset();
    AUTHENTICATION_SERVICE_MOCK.getIdToken.and.resolveTo('firebase-token');
    AUTHENTICATION_SERVICE_MOCK.setCurrentUser({ email: 'user@example.com' } as any);

    MINFACTORY_USER_REPOSITORY_MOCK.get.calls.reset();
    MINFACTORY_USER_REPOSITORY_MOCK.get.and.callFake(async () => ({
      createdAt: '2026-03-19T10:00:00.000Z',
      email: 'user@example.com',
    }));
    MINFACTORY_USER_REPOSITORY_MOCK.create.calls.reset();
    MINFACTORY_USER_REPOSITORY_MOCK.create.and.callFake(async () => ({
      createdAt: '2026-03-19T10:00:00.000Z',
      email: 'user@example.com',
    }));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinFactoryAuthenticationService,
        { provide: AuthenticationService, useValue: AUTHENTICATION_SERVICE_MOCK },
        { provide: MinFactoryUserRepository, useValue: MINFACTORY_USER_REPOSITORY_MOCK },
      ],
    });

    service = TestBed.inject(MinFactoryAuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loginUser()', () => {
    it('should login with firebase and then fetch minfactory user', async () => {
      const result = await service.loginUser('user@example.com', 'password123');

      expect(AUTHENTICATION_SERVICE_MOCK.loginWithEmailAndPassword).toHaveBeenCalledWith(
        'user@example.com',
        'password123',
      );
      expect(MINFACTORY_USER_REPOSITORY_MOCK.get).toHaveBeenCalled();
      expect(result.email).toBe('user@example.com');
      expect(result.createdAt).toEqual(new Date('2026-03-19T10:00:00.000Z'));
    });

    it('should not fetch minfactory user when firebase login fails', async () => {
      AUTHENTICATION_SERVICE_MOCK.loginWithEmailAndPassword.and.returnValue(
        Promise.reject(new Error('Ungültige Anmeldedaten.')),
      );

      await expectAsync(service.loginUser('user@example.com', 'wrongpassword')).toBeRejectedWithError(
        'Ungültige Anmeldedaten.',
      );
      expect(MINFACTORY_USER_REPOSITORY_MOCK.get).not.toHaveBeenCalled();
    });

    it('should throw error when fetching user fails', async () => {
      MINFACTORY_USER_REPOSITORY_MOCK.get.and.returnValue(Promise.reject(new Error('Benutzer nicht gefunden.')));

      await expectAsync(service.loginUser('user@example.com', 'password123')).toBeRejectedWithError(
        'Benutzer nicht gefunden.',
      );
    });
  });

  describe('registerUser()', () => {
    it('should register with firebase and then create minfactory user', async () => {
      const result = await service.registerUser('user@example.com', 'password123');

      expect(AUTHENTICATION_SERVICE_MOCK.registerWithEmailAndPassword).toHaveBeenCalledWith(
        'user@example.com',
        'password123',
      );
      expect(AUTHENTICATION_SERVICE_MOCK.getIdToken).toHaveBeenCalledWith(true);
      expect(MINFACTORY_USER_REPOSITORY_MOCK.create).toHaveBeenCalled();
      expect(result.email).toBe('user@example.com');
      expect(result.createdAt).toEqual(new Date('2026-03-19T10:00:00.000Z'));
    });

    it('should continue registration when firebase email already exists but current user matches', async () => {
      AUTHENTICATION_SERVICE_MOCK.registerWithEmailAndPassword.and.returnValue(
        Promise.reject(new Error('Diese E-Mail-Adresse wird bereits verwendet.')),
      );

      const result = await service.registerUser('user@example.com', 'password123');

      expect(AUTHENTICATION_SERVICE_MOCK.getIdToken).toHaveBeenCalledWith(true);
      expect(MINFACTORY_USER_REPOSITORY_MOCK.create).toHaveBeenCalled();
      expect(result.email).toBe('user@example.com');
    });

    it('should not create minfactory user when firebase registration fails', async () => {
      AUTHENTICATION_SERVICE_MOCK.registerWithEmailAndPassword.and.returnValue(
        Promise.reject(new Error('firebase failed')),
      );

      await expectAsync(service.registerUser('user@example.com', 'password123')).toBeRejectedWithError(
        'firebase failed',
      );
      expect(MINFACTORY_USER_REPOSITORY_MOCK.create).not.toHaveBeenCalled();
    });

    it('should fail fast when no id token is available after registration', async () => {
      AUTHENTICATION_SERVICE_MOCK.getIdToken.and.returnValue(Promise.resolve(null));

      await expectAsync(service.registerUser('user@example.com', 'password123')).toBeRejectedWithError(
        'Konto erstellt, aber keine gueltige Session vorhanden. Bitte erneut versuchen.',
      );
      expect(MINFACTORY_USER_REPOSITORY_MOCK.create).not.toHaveBeenCalled();
    });

    it('should not continue email-already-in-use flow when current user does not match', async () => {
      AUTHENTICATION_SERVICE_MOCK.setCurrentUser({ email: 'other@example.com' } as any);
      AUTHENTICATION_SERVICE_MOCK.registerWithEmailAndPassword.and.returnValue(
        Promise.reject(new Error('Diese E-Mail-Adresse wird bereits verwendet.')),
      );

      await expectAsync(service.registerUser('user@example.com', 'password123')).toBeRejectedWithError(
        'Diese E-Mail-Adresse wird bereits verwendet.',
      );
      expect(MINFACTORY_USER_REPOSITORY_MOCK.create).not.toHaveBeenCalled();
    });
  });

  describe('logoutUser()', () => {
    it('should sign out via firebase', async () => {
      await service.logoutUser();

      expect(AUTHENTICATION_SERVICE_MOCK.signOut).toHaveBeenCalled();
    });

    it('should throw error when firebase sign out fails', async () => {
      AUTHENTICATION_SERVICE_MOCK.signOut.and.returnValue(Promise.reject(new Error('Sign out failed.')));

      await expectAsync(service.logoutUser()).toBeRejectedWithError('Sign out failed.');
    });
  });
});
