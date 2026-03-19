import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import * as firebaseAuth from '@angular/fire/auth';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let authMock: {
    currentUser: firebaseAuth.User | null;
    onAuthStateChanged: jasmine.Spy;
    signOut: jasmine.Spy;
  };
  let authStateChangedCallback: ((user: firebaseAuth.User | null) => void) | undefined;

  beforeEach(() => {
    authMock = {
      currentUser: null,
      onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.callFake((nextOrObserver: unknown) => {
        authStateChangedCallback =
          typeof nextOrObserver === 'function'
            ? (nextOrObserver as (user: firebaseAuth.User | null) => void)
            : (nextOrObserver as { next?: (user: firebaseAuth.User | null) => void }).next;

        return () => undefined;
      }),
      signOut: jasmine.createSpy('signOut').and.resolveTo(),
    };

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: Auth, useValue: authMock as unknown as Auth }],
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update auth signals when auth state changes', () => {
    const currentUser = {
      getIdToken: jasmine.createSpy('getIdToken').and.resolveTo('firebase-token'),
    } as unknown as firebaseAuth.User;

    authStateChangedCallback?.(currentUser);

    expect(service.currentUser()).toBe(currentUser);
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should return null when no current user exists', async () => {
    await expectAsync(service.getIdToken()).toBeResolvedTo(null);
  });

  it('should return the firebase id token of the current user', async () => {
    const getIdToken = jasmine.createSpy('getIdToken').and.resolveTo('firebase-token');
    authMock.currentUser = { getIdToken } as unknown as firebaseAuth.User;

    await expectAsync(service.getIdToken(true)).toBeResolvedTo('firebase-token');
    expect(getIdToken).toHaveBeenCalledOnceWith(true);
  });

  it('should sign out through firebase auth', async () => {
    await service.signOut();

    expect(authMock.signOut).toHaveBeenCalledOnceWith();
  });
});
