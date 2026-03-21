import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Auth as FirebaseAuth, User as FirebaseUser } from '@angular/fire/auth';
import { FIREBASE_AUTH_MOCK } from '../../shared/mocks/firebase-auth.mock';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(() => {
    FIREBASE_AUTH_MOCK.currentUser = null;
    FIREBASE_AUTH_MOCK.onAuthStateChanged.calls.reset();
    FIREBASE_AUTH_MOCK.signOut.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: FirebaseAuth, useValue: FIREBASE_AUTH_MOCK as unknown as FirebaseAuth },
      ],
    });

    service = TestBed.inject(AuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update auth signals when auth state changes', () => {
    const currentUser = {
      getIdToken: jasmine.createSpy('getIdToken').and.resolveTo('firebase-token'),
    } as unknown as FirebaseUser;

    FIREBASE_AUTH_MOCK.emitAuthStateChanged(currentUser);

    expect(service.currentUser()).toBe(currentUser);
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should return null when no current user exists', async () => {
    await expectAsync(service.getIdToken()).toBeResolvedTo(null);
  });

  it('should return the firebase id token of the current user', async () => {
    const getIdToken = jasmine.createSpy('getIdToken').and.resolveTo('firebase-token');
    FIREBASE_AUTH_MOCK.currentUser = { getIdToken } as unknown as FirebaseUser;

    await expectAsync(service.getIdToken(true)).toBeResolvedTo('firebase-token');
    expect(getIdToken).toHaveBeenCalledOnceWith(true);
  });

  it('should sign out through firebase auth', async () => {
    await service.signOut();

    expect(FIREBASE_AUTH_MOCK.signOut).toHaveBeenCalledOnceWith();
  });
});
