import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from '../../../core/authentication/authentication.service';
import { MinFactoryUserRepository } from '../repositories/minfactory-user.repository';
import { MINFACTORY_USER_REPOSITORY_MOCK } from '../repositories/minfactory-user.repository.mock';
import { MinFactoryAuthenticationService } from './minfactory-authentication.service';
import { MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK } from './minfactory-firebase-authentication.service.mock';

describe('MinFactoryAuthenticationService', () => {
  let service: MinFactoryAuthenticationService;

  beforeEach(() => {
    MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.loginWithEmailAndPassword.calls.reset();
    MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.loginWithEmailAndPassword.and.resolveTo();
    MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.registerWithEmailAndPassword.calls.reset();
    MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.registerWithEmailAndPassword.and.resolveTo();
    MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.signOut.calls.reset();
    MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.signOut.and.resolveTo();
    MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.currentUser.calls.reset();
    MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.currentUser.and.returnValue({ email: 'user@example.com' });
    MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.getIdToken.calls.reset();
    MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.getIdToken.and.resolveTo('firebase-token');

    MINFACTORY_USER_REPOSITORY_MOCK.getMe.calls.reset();
    MINFACTORY_USER_REPOSITORY_MOCK.getMe.and.callFake(async () => ({
      createdAt: '2026-03-19T10:00:00.000Z',
      email: 'user@example.com',
    }));
    MINFACTORY_USER_REPOSITORY_MOCK.createUser.calls.reset();
    MINFACTORY_USER_REPOSITORY_MOCK.createUser.and.callFake(async () => ({
      createdAt: '2026-03-19T10:00:00.000Z',
      email: 'user@example.com',
    }));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinFactoryAuthenticationService,
        { provide: AuthenticationService, useValue: MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK },
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

      expect(MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.loginWithEmailAndPassword).toHaveBeenCalledWith(
        'user@example.com',
        'password123',
      );
      expect(MINFACTORY_USER_REPOSITORY_MOCK.getMe).toHaveBeenCalled();
      expect(result.email).toBe('user@example.com');
      expect(result.createdAt).toEqual(new Date('2026-03-19T10:00:00.000Z'));
    });

    it('should not fetch minfactory user when firebase login fails', async () => {
      MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.loginWithEmailAndPassword.and.returnValue(
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

  describe('registerUser()', () => {
    it('should register with firebase and then create minfactory user', async () => {
      const result = await service.registerUser('user@example.com', 'password123');

      expect(MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.registerWithEmailAndPassword).toHaveBeenCalledWith(
        'user@example.com',
        'password123',
      );
      expect(MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.getIdToken).toHaveBeenCalledWith(true);
      expect(MINFACTORY_USER_REPOSITORY_MOCK.createUser).toHaveBeenCalled();
      expect(result.email).toBe('user@example.com');
      expect(result.createdAt).toEqual(new Date('2026-03-19T10:00:00.000Z'));
    });

    it('should continue registration when firebase email already exists but current user matches', async () => {
      MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.registerWithEmailAndPassword.and.returnValue(
        Promise.reject(new Error('Diese E-Mail-Adresse wird bereits verwendet.')),
      );

      const result = await service.registerUser('user@example.com', 'password123');

      expect(MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.currentUser).toHaveBeenCalled();
      expect(MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.getIdToken).toHaveBeenCalledWith(true);
      expect(MINFACTORY_USER_REPOSITORY_MOCK.createUser).toHaveBeenCalled();
      expect(result.email).toBe('user@example.com');
    });

    it('should not create minfactory user when firebase registration fails', async () => {
      MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.registerWithEmailAndPassword.and.returnValue(
        Promise.reject(new Error('firebase failed')),
      );

      await expectAsync(service.registerUser('user@example.com', 'password123')).toBeRejectedWithError(
        'firebase failed',
      );
      expect(MINFACTORY_USER_REPOSITORY_MOCK.createUser).not.toHaveBeenCalled();
    });

    it('should fail fast when no id token is available after registration', async () => {
      MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.getIdToken.and.returnValue(Promise.resolve(null));

      await expectAsync(service.registerUser('user@example.com', 'password123')).toBeRejectedWithError(
        'Konto erstellt, aber keine gueltige Session vorhanden. Bitte erneut versuchen.',
      );
      expect(MINFACTORY_USER_REPOSITORY_MOCK.createUser).not.toHaveBeenCalled();
    });

    it('should not continue email-already-in-use flow when current user does not match', async () => {
      MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.currentUser.and.returnValue({ email: 'other@example.com' });
      MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.registerWithEmailAndPassword.and.returnValue(
        Promise.reject(new Error('Diese E-Mail-Adresse wird bereits verwendet.')),
      );

      await expectAsync(service.registerUser('user@example.com', 'password123')).toBeRejectedWithError(
        'Diese E-Mail-Adresse wird bereits verwendet.',
      );
      expect(MINFACTORY_USER_REPOSITORY_MOCK.createUser).not.toHaveBeenCalled();
    });
  });

  describe('logoutUser()', () => {
    it('should sign out via firebase', async () => {
      await service.logoutUser();

      expect(MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.signOut).toHaveBeenCalled();
    });

    it('should throw error when firebase sign out fails', async () => {
      MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK.signOut.and.returnValue(
        Promise.reject(new Error('Sign out failed.')),
      );

      await expectAsync(service.logoutUser()).toBeRejectedWithError('Sign out failed.');
    });
  });
});
