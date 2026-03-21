import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/routing/routing.service';
import { MinFactoryLogoutService } from '../../services/minfactory-logout.service';
import { MinFactoryProfileService } from '../../services/minfactory-profile.service';
import { MINFACTORY_LOGOUT_SERVICE_MOCK } from '../../services/minfactory-logout.service.mock';
import { MINFACTORY_PROFILE_SERVICE_MOCK } from '../../services/minfactory-profile.service.mock';
import { MINFACTORY_ROUTING_SERVICE_MOCK } from '../../services/minfactory-routing.service.mock';
import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  const flushMicrotasks = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
  };

  const settleLogout = async (): Promise<void> => {
    const logoutPromise: Promise<unknown> | undefined = MINFACTORY_LOGOUT_SERVICE_MOCK.logoutUser.calls.mostRecent()
      ?.returnValue as Promise<unknown> | undefined;

    try {
      await logoutPromise;
    } catch {
      // Intentionally ignored for tests that assert failure behavior.
    }

    await flushMicrotasks();
  };

  beforeEach(async () => {
    MINFACTORY_PROFILE_SERVICE_MOCK.loadProfile.calls.reset();
    MINFACTORY_PROFILE_SERVICE_MOCK.loadProfile.and.callFake(async () => ({
      createdAt: '19.03.2026, 11:00',
      email: 'user@example.com',
    }));
    MINFACTORY_LOGOUT_SERVICE_MOCK.logoutUser.calls.reset();
    MINFACTORY_LOGOUT_SERVICE_MOCK.logoutUser.and.resolveTo();
    MINFACTORY_ROUTING_SERVICE_MOCK.navigateToLogin.calls.reset();
    MINFACTORY_ROUTING_SERVICE_MOCK.navigateToHomePage.calls.reset();
    MINFACTORY_ROUTING_SERVICE_MOCK.navigateToApps.calls.reset();

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinFactoryProfileService, useValue: MINFACTORY_PROFILE_SERVICE_MOCK },
        { provide: MinFactoryLogoutService, useValue: MINFACTORY_LOGOUT_SERVICE_MOCK },
        { provide: RoutingService, useValue: MINFACTORY_ROUTING_SERVICE_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(MINFACTORY_PROFILE_SERVICE_MOCK.loadProfile).toHaveBeenCalled();
    expect(component.profile()?.email).toBe('user@example.com');
    expect(component.isLoading()).toBeFalse();
    expect(component.isError()).toBeFalse();
  });

  it('should navigate to login when profile loading fails with unauthorized error', async () => {
    MINFACTORY_PROFILE_SERVICE_MOCK.loadProfile.and.returnValue(Promise.reject(new Error('401 Unauthorized')));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(MINFACTORY_ROUTING_SERVICE_MOCK.navigateToLogin).toHaveBeenCalled();
  });

  it('should expose error state when profile loading fails', async () => {
    MINFACTORY_PROFILE_SERVICE_MOCK.loadProfile.and.returnValue(Promise.reject(new Error('Server down')));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isError()).toBeTrue();
    expect(component.errorMessage()).toBe('Server down');
    expect(component.profile()).toBeNull();
  });

  it('should navigate to apps', () => {
    component.navigateToApps();

    expect(MINFACTORY_ROUTING_SERVICE_MOCK.navigateToApps).toHaveBeenCalled();
  });

  it('should reload profile when reloadProfile is called', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    MINFACTORY_PROFILE_SERVICE_MOCK.loadProfile.calls.reset();

    component.reloadProfile();
    await fixture.whenStable();

    expect(MINFACTORY_PROFILE_SERVICE_MOCK.loadProfile).toHaveBeenCalled();
  });

  describe('logout()', () => {
    it('should logout and navigate to home page on success', async () => {
      component.logout();
      await settleLogout();

      expect(MINFACTORY_LOGOUT_SERVICE_MOCK.logoutUser).toHaveBeenCalled();
      expect(MINFACTORY_ROUTING_SERVICE_MOCK.navigateToHomePage).toHaveBeenCalled();
    });

    it('should set isLogoutSubmitting while logout is in progress', () => {
      component.logout();

      expect(component.isLogoutSubmitting()).toBeTrue();
    });

    it('should not call logoutUser when already submitting', () => {
      component.logout();
      component.logout();

      expect(MINFACTORY_LOGOUT_SERVICE_MOCK.logoutUser).toHaveBeenCalledTimes(1);
    });

    it('should show snackbar and reset submitting state when logout fails', async () => {
      const errorMessage = 'Logout fehlgeschlagen.';
      MINFACTORY_LOGOUT_SERVICE_MOCK.logoutUser.and.returnValue(Promise.reject(new Error(errorMessage)));

      component.logout();
      await settleLogout();

      expect(component.isLogoutSubmitting()).toBeFalse();
      expect(component.isSnackbarOpen()).toBeTrue();
      expect(component.snackbarMessage()).toBe(errorMessage);
      expect(MINFACTORY_ROUTING_SERVICE_MOCK.navigateToHomePage).not.toHaveBeenCalled();
    });

    it('should close snackbar when closeSnackbar is called', async () => {
      MINFACTORY_LOGOUT_SERVICE_MOCK.logoutUser.and.returnValue(Promise.reject(new Error('error')));
      component.logout();
      await settleLogout();

      component.closeSnackbar();

      expect(component.isSnackbarOpen()).toBeFalse();
      expect(component.snackbarMessage()).toBe('');
    });
  });
});
