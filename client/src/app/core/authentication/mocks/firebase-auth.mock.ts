import * as firebaseAuth from '@angular/fire/auth';

let onAuthStateChangedCallback: ((user: firebaseAuth.User | null) => void) | undefined;

export const FIREBASE_AUTH_MOCK = {
  currentUser: null as firebaseAuth.User | null,
  onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.callFake((nextOrObserver: unknown) => {
    onAuthStateChangedCallback =
      typeof nextOrObserver === 'function'
        ? (nextOrObserver as (user: firebaseAuth.User | null) => void)
        : (nextOrObserver as { next?: (user: firebaseAuth.User | null) => void }).next;

    return () => undefined;
  }),
  signOut: jasmine.createSpy('signOut').and.resolveTo(),
  emitAuthStateChanged: (user: firebaseAuth.User | null): void => {
    onAuthStateChangedCallback?.(user);
  },
};
