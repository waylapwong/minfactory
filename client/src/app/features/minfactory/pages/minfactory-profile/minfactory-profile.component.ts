import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Signal, WritableSignal, computed, signal } from '@angular/core';
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
  public readonly deleteRequestState: WritableSignal<RequestState> = signal(RequestState.Idle);
  public readonly deleteRequestError: Signal<string> = computed(() =>
    this.deleteRequestState() === RequestState.Error
      ? 'Account konnte nicht gelöscht werden. Bitte versuche es erneut.'
      : '',
  );
  public readonly isDeleteDialogOpen: WritableSignal<boolean> = signal(false);
  public readonly logoutRequestState: WritableSignal<RequestState> = signal(RequestState.Idle);
  public readonly logoutRequestError: Signal<string> = computed(() =>
    this.logoutRequestState() === RequestState.Error ? 'Logout fehlgeschlagen. Bitte versuche es erneut.' : '',
  );
  public readonly profileRequestState: WritableSignal<RequestState> = signal(RequestState.Idle);
  public readonly profileRequestError: Signal<string> = computed(() =>
    this.profileRequestState() === RequestState.Error
      ? 'Accountdaten konnten nicht geladen werden. Bitte versuche es erneut.'
      : '',
  );

  constructor(
    private readonly authenticationService: MinFactoryAuthenticationService,
    private readonly routingService: RoutingService,
    public readonly userService: MinFactoryUserService,
  ) {}

  public ngOnInit(): void {
    this.reloadProfile();
  }

  public closeDeleteDialog(): void {
    this.isDeleteDialogOpen.set(false);
  }

  public async deleteAccount(): Promise<void> {
    // Prevent multiple Attempts
    if (this.deleteRequestState() === RequestState.Loading) {
      return;
    }
    // Set Loading State
    this.deleteRequestState.set(RequestState.Loading);
    // Delete Account
    try {
      await this.authenticationService.deleteAccount();
      this.deleteRequestState.set(RequestState.Success);
      this.closeDeleteDialog();
      this.routingService.navigateToHomePage();
    } catch {
      this.deleteRequestState.set(RequestState.Error);
    }
  }

  public async logout(): Promise<void> {
    // Prevent multiple Attempts
    if (this.logoutRequestState() === RequestState.Loading) {
      return;
    }
    // Set Loading State
    this.logoutRequestState.set(RequestState.Loading);
    // Logout
    try {
      await this.authenticationService.logoutUser();
      this.logoutRequestState.set(RequestState.Success);
      this.routingService.navigateToHomePage();
    } catch {
      this.logoutRequestState.set(RequestState.Error);
    }
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
    }
  }
}
