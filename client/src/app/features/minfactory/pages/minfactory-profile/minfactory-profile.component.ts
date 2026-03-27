import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { Color } from '../../../../shared/enums/color.enum';
import { RequestState } from '../../../../shared/enums/request-state.enum';
import { MinFactoryAuthenticationService } from '../../services/minfactory-authentication.service';
import { MinFactoryUserService } from '../../services/minfactory-user.service';

@Component({
  selector: 'minfactory-profile',
  templateUrl: './minfactory-profile.component.html',
  styleUrls: ['./minfactory-profile.component.scss'],
  host: { class: 'block h-full w-full' },
  imports: [CardComponent, ButtonComponent, DialogComponent, H2Component],
})
export class MinFactoryProfileComponent implements OnInit {
  public readonly Color: typeof Color = Color;
  public readonly RequestState: typeof RequestState = RequestState;
  public readonly errorMessage: WritableSignal<string> = signal('');
  public readonly isDeleteDialogOpen: WritableSignal<boolean> = signal(false);
  public readonly isDeleteSubmitting: WritableSignal<boolean> = signal(false);
  public readonly logoutRequestState: WritableSignal<RequestState> = signal(RequestState.Idle);
  public readonly profileRequestError: WritableSignal<string> = signal('');
  public readonly profileRequestState: WritableSignal<RequestState> = signal(RequestState.Idle);

  constructor(
    private readonly authenticationService: MinFactoryAuthenticationService,
    private readonly routingService: RoutingService,
    public readonly userService: MinFactoryUserService,
  ) {}

  public ngOnInit(): void {
    this.reloadProfile();
  }

  public cancelDeleteAccount(): void {
    this.isDeleteDialogOpen.set(false);
  }

  public confirmDeleteAccount(): void {
    if (this.isDeleteSubmitting()) {
      return;
    }

    this.isDeleteDialogOpen.set(false);
    this.performDeleteAccount();
  }

  public logout(): void {
    if (this.logoutRequestState() === RequestState.Loading) {
      return;
    }
    this.logoutRequestState.set(RequestState.Loading);
    this.performLogout();
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
    this.profileRequestState.set(RequestState.Loading);
    this.errorMessage.set('');
    try {
      await this.userService.loadProfile();
      this.profileRequestState.set(RequestState.Success);
    } catch (error) {
      if (this.isUnauthorizedError(error)) {
        this.routingService.navigateToLogin();
        return;
      }
      this.userService.clearUserCache();
      this.profileRequestState.set(RequestState.Error);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Accountdaten konnten nicht geladen werden. Bitte versuche es erneut.',
      );
    }
  }

  private async performDeleteAccount(): Promise<void> {
    this.isDeleteSubmitting.set(true);

    try {
      await this.authenticationService.deleteAccount();
      this.isDeleteSubmitting.set(false);
      this.routingService.navigateToHomePage();
    } catch {
      this.isDeleteSubmitting.set(false);
    }
  }

  private async performLogout(): Promise<void> {
    try {
      await this.authenticationService.logoutUser();
      this.routingService.navigateToHomePage();
    } catch {
      this.logoutRequestState.set(RequestState.Error);
    }
  }
}
