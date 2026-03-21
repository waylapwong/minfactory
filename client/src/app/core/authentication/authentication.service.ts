import { DestroyRef, Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import {
  Auth as FirebaseAuth,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly cachedCurrentUser: WritableSignal<FirebaseUser | null> = signal(null);

  public currentUser: Signal<FirebaseUser | null> = computed(() => this.cachedCurrentUser());
  public isAuthenticated: Signal<boolean> = computed(() => this.currentUser() !== null);

  constructor(
    private readonly firebaseAuth: FirebaseAuth,
    private readonly destroyRef: DestroyRef,
  ) {
    const unsubscribe = this.firebaseAuth.onAuthStateChanged((user: FirebaseUser | null) => {
      this.cachedCurrentUser.set(user);
    });
    this.destroyRef.onDestroy(unsubscribe);
  }

  public async getIdToken(forceRefresh: boolean = false): Promise<string | null> {
    const currentUser: FirebaseUser | null = this.firebaseAuth.currentUser ?? this.currentUser();

    if (!currentUser) {
      return null;
    }

    return currentUser.getIdToken(forceRefresh);
  }

  public async loginWithEmailAndPassword(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.firebaseAuth, email, password);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  public async registerWithEmailAndPassword(email: string, password: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(this.firebaseAuth, email, password);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  public async signOut(): Promise<void> {
    await this.firebaseAuth.signOut();
  }

  private handleAuthError(error: unknown): Error {
    if (error instanceof Error) {
      if (error.message.includes('user-not-found')) {
        return new Error('Kein Konto mit dieser E-Mail-Adresse gefunden.');
      }
      if (error.message.includes('wrong-password')) {
        return new Error('Falsches Passwort. Bitte versuche es erneut.');
      }
      if (error.message.includes('invalid-credential')) {
        return new Error('Ungültige Anmeldedaten.');
      }
      if (error.message.includes('too-many-requests')) {
        return new Error('Zu viele Anfragen. Bitte warte kurz und versuche es erneut.');
      }
      if (error.message.includes('email-already-in-use')) {
        return new Error('Diese E-Mail-Adresse wird bereits verwendet.');
      }
      if (error.message.includes('weak-password')) {
        return new Error('Das Passwort ist zu schwach. Bitte verwende mindestens 8 Zeichen.');
      }
      if (error.message.includes('invalid-email')) {
        return new Error('Die E-Mail-Adresse ist ungültig.');
      }
      return new Error(error.message);
    }
    return new Error('Ein unbekannter Fehler ist aufgetreten.');
  }
}
