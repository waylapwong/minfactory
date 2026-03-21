import { WritableSignal, computed, signal } from '@angular/core';
import { User as FirebaseUser } from '@angular/fire/auth';

const cachedCurrentUser: WritableSignal<FirebaseUser | null> = signal(null);

export const AUTHENTICATION_SERVICE_MOCK = {
  currentUser: computed(() => cachedCurrentUser()),
  isAuthenticated: computed(() => cachedCurrentUser() !== null),
  getIdToken: jasmine
    .createSpy('getIdToken')
    .and.callFake(async (forceRefresh: boolean = false) => cachedCurrentUser()?.getIdToken(forceRefresh) ?? null),
  loginWithEmailAndPassword: jasmine.createSpy('loginWithEmailAndPassword').and.resolveTo(),
  registerWithEmailAndPassword: jasmine.createSpy('registerWithEmailAndPassword').and.resolveTo(),
  signOut: jasmine.createSpy('signOut').and.callFake(async () => {
    cachedCurrentUser.set(null);
  }),
  setCurrentUser: (user: FirebaseUser | null): void => {
    cachedCurrentUser.set(user);
  },
};
