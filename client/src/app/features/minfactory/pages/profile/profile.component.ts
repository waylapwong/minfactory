import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { RoutingService } from '../../../../core/services/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinFactoryProfileViewModel } from '../../models/viewmodels/minfactory-profile.viewmodel';
import { MinFactoryProfileService } from '../../services/minfactory-profile.service';

@Component({
  selector: 'minfactory-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  host: { class: 'block h-full w-full' },
  imports: [CardComponent, H1Component, ButtonComponent],
})
export class ProfileComponent implements OnInit {
  public readonly Color: typeof Color = Color;
  public readonly errorMessage: WritableSignal<string> = signal('');
  public readonly isError: WritableSignal<boolean> = signal(false);
  public readonly isLoading: WritableSignal<boolean> = signal(true);
  public readonly profile: WritableSignal<MinFactoryProfileViewModel | null> = signal(null);

  constructor(
    private readonly profileService: MinFactoryProfileService,
    private readonly routingService: RoutingService,
  ) {}

  public ngOnInit(): void {
    this.reloadProfile();
  }

  public navigateToApps(): void {
    this.routingService.navigateToApps();
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
      const profile: MinFactoryProfileViewModel = await this.profileService.loadProfile();
      this.profile.set(profile);
    } catch (error) {
      if (this.isUnauthorizedError(error)) {
        this.routingService.navigateToLogin();
        return;
      }

      this.profile.set(null);
      this.isError.set(true);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Profil konnte nicht geladen werden. Bitte versuche es erneut.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
