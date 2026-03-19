import { DestroyRef, Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { createUserWithEmailAndPassword } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth: Auth = inject(Auth);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly cachedCurrentUser: WritableSignal<User | null> = signal(null);

  public currentUser: Signal<User | null> = computed(() => this.cachedCurrentUser());
  public isAuthenticated: Signal<boolean> = computed(() => this.currentUser() !== null);

  constructor() {
    const unsubscribe = this.auth.onAuthStateChanged((user: User | null) => {
      this.cachedCurrentUser.set(user);
    });

    this.destroyRef.onDestroy(unsubscribe);
  }

  public async getIdToken(forceRefresh: boolean = false): Promise<string | null> {
    const currentUser: User | null = this.auth.currentUser ?? this.currentUser();

    if (!currentUser) {
      return null;
    }

    return currentUser.getIdToken(forceRefresh);
  }

  public async signOut(): Promise<void> {
    await this.auth.signOut();
  }

  public async registerWithEmailAndPassword(email: string, password: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  private handleAuthError(error: unknown): Error {
    if (error instanceof Error) {
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
