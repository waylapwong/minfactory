import { User as FirebaseUser } from '@angular/fire/auth';

export const MINFACTORY_FIREBASE_AUTHENTICATION_SERVICE_MOCK = {
  currentUser: jasmine.createSpy('currentUser').and.returnValue({ email: 'user@example.com' } as FirebaseUser),
  getIdToken: jasmine.createSpy('getIdToken').and.resolveTo('firebase-token'),
  loginWithEmailAndPassword: jasmine.createSpy('loginWithEmailAndPassword').and.resolveTo(),
  registerWithEmailAndPassword: jasmine.createSpy('registerWithEmailAndPassword').and.resolveTo(),
  signOut: jasmine.createSpy('signOut').and.resolveTo(),
};
