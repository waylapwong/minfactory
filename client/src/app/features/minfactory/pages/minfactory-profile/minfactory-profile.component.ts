import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { SnackbarComponent } from '../../../../shared/components/snackbar/snackbar.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinFactoryAuthenticationService } from '../../services/minfactory-authentication.service';
import { MinFactoryUserService } from '../../services/minfactory-user.service';

@Component({
  selector: 'minfactory-profile',
  templateUrl: './minfactory-profile.component.html',
  styleUrl: './minfactory-profile.component.scss',
  host: { class: 'block h-full w-full' },
  imports: [CardComponent, H1Component, ButtonComponent, SnackbarComponent, LogoComponent, DialogComponent],
})
export class MinFactoryProfileComponent implements OnInit {
  public readonly Color: typeof Color = Color;
  public readonly errorMessage: WritableSignal<string> = signal('');
  public readonly isDeleteDialogOpen: WritableSignal<boolean> = signal(false);
  public readonly isDeleteSubmitting: WritableSignal<boolean> = signal(false);
  public readonly isError: WritableSignal<boolean> = signal(false);
  public readonly isLoading: WritableSignal<boolean> = signal(true);
  public readonly isLogoutSubmitting: WritableSignal<boolean> = signal(false);
  public readonly isSnackbarOpen: WritableSignal<boolean> = signal(false);
  public readonly snackbarMessage: WritableSignal<string> = signal('');

  constructor(
    public readonly userService: MinFactoryUserService,
    private readonly authenticationService: MinFactoryAuthenticationService,
    private readonly routingService: RoutingService,
  ) {}

  public ngOnInit(): void {
    this.reloadProfile();
  }

  public cancelDeleteAccount(): void {
    this.isDeleteDialogOpen.set(false);
  }

  public closeSnackbar(): void {
    this.isSnackbarOpen.set(false);
    this.snackbarMessage.set('');
  }

  public confirmDeleteAccount(): void {
    if (this.isDeleteSubmitting()) {
      return;
    }

    this.isDeleteDialogOpen.set(false);
    this.performDeleteAccount();
  }

  public logout(): void {
    if (this.isLogoutSubmitting()) {
      return;
    }

    this.isLogoutSubmitting.set(true);
    this.closeSnackbar();

    this.performLogout();
  }

  public navigateToApps(): void {
    this.routingService.navigateToApps();
  }

  public openDeleteDialog(): void {
    this.isDeleteDialogOpen.set(true);
  }

  public reloadProfile(): void {
    this.loadProfile();
  }

  private isUnauthorizedError(error: unknown): boolean {
    if (error instanceof HttpErrorResponse) {
      return error.status === 401;
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes('401') || message.includes('unauthorized') || message.includes('unauthenticated');
    }

    return false;
  }

  private async loadProfile(): Promise<void> {
    this.isLoading.set(true);
    this.isError.set(false);
    this.errorMessage.set('');

    try {
      await this.userService.loadProfile();
    } catch (error) {
      if (this.isUnauthorizedError(error)) {
        this.routingService.navigateToLogin();
        return;
      }

      this.userService.clearProfileCache();
      this.isError.set(true);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Profil konnte nicht geladen werden. Bitte versuche es erneut.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  private async performDeleteAccount(): Promise<void> {
    this.isDeleteSubmitting.set(true);
    this.closeSnackbar();

    try {
      await this.authenticationService.deleteAccount();
      this.isDeleteSubmitting.set(false);
      this.routingService.navigateToHomePage();
    } catch (error) {
      this.isDeleteSubmitting.set(false);
      const errorMessage =
        error instanceof Error ? error.message : 'Account konnte nicht gelöscht werden. Bitte versuche es erneut.';
      this.snackbarMessage.set(errorMessage);
      this.isSnackbarOpen.set(true);
    }
  }

  private async performLogout(): Promise<void> {
    try {
      await this.authenticationService.logoutUser();
      this.routingService.navigateToHomePage();
    } catch (error) {
      this.isLogoutSubmitting.set(false);
      const errorMessage =
        error instanceof Error ? error.message : 'Abmelden fehlgeschlagen. Bitte versuche es erneut.';
      this.snackbarMessage.set(errorMessage);
      this.isSnackbarOpen.set(true);
    }
  }
}
