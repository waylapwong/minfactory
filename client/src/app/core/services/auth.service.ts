import { DestroyRef, Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';

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
}