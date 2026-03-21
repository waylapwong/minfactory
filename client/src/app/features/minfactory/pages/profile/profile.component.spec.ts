import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/services/routing.service';
import { MinFactoryLogoutService } from '../../services/minfactory-logout.service';
import { MinFactoryProfileService } from '../../services/minfactory-profile.service';
import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let profileServiceMock: { loadProfile: jasmine.Spy };
  let logoutServiceMock: { logoutUser: jasmine.Spy };
  let routingServiceMock: {
    navigateToApps: jasmine.Spy;
    navigateToLogin: jasmine.Spy;
    navigateToHomePage: jasmine.Spy;
  };

  const flushMicrotasks = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
  };

  const settleLogout = async (): Promise<void> => {
    const logoutPromise: Promise<unknown> | undefined = logoutServiceMock.logoutUser.calls.mostRecent()?.returnValue as
      | Promise<unknown>
      | undefined;

    try {
      await logoutPromise;
    } catch {
      // Intentionally ignored for tests that assert failure behavior.
    }

    await flushMicrotasks();
  };

  beforeEach(async () => {
    profileServiceMock = {
      loadProfile: jasmine.createSpy('loadProfile').and.returnValue(
        Promise.resolve({
          createdAt: '19.03.2026, 11:00',
          email: 'user@example.com',
        }),
      ),
    };

    logoutServiceMock = {
      logoutUser: jasmine.createSpy('logoutUser').and.returnValue(Promise.resolve()),
    };

    routingServiceMock = {
      navigateToApps: jasmine.createSpy('navigateToApps'),
      navigateToLogin: jasmine.createSpy('navigateToLogin'),
      navigateToHomePage: jasmine.createSpy('navigateToHomePage'),
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinFactoryProfileService, useValue: profileServiceMock },
        { provide: MinFactoryLogoutService, useValue: logoutServiceMock },
        { provide: RoutingService, useValue: routingServiceMock },
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

    expect(profileServiceMock.loadProfile).toHaveBeenCalled();
    expect(component.profile()?.email).toBe('user@example.com');
    expect(component.isLoading()).toBeFalse();
    expect(component.isError()).toBeFalse();
  });

  it('should navigate to login when profile loading fails with unauthorized error', async () => {
    profileServiceMock.loadProfile.and.returnValue(Promise.reject(new Error('401 Unauthorized')));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(routingServiceMock.navigateToLogin).toHaveBeenCalled();
  });

  it('should expose error state when profile loading fails', async () => {
    profileServiceMock.loadProfile.and.returnValue(Promise.reject(new Error('Server down')));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isError()).toBeTrue();
    expect(component.errorMessage()).toBe('Server down');
    expect(component.profile()).toBeNull();
  });

  it('should navigate to apps', () => {
    component.navigateToApps();

    expect(routingServiceMock.navigateToApps).toHaveBeenCalled();
  });

  it('should reload profile when reloadProfile is called', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    profileServiceMock.loadProfile.calls.reset();

    component.reloadProfile();
    await fixture.whenStable();

    expect(profileServiceMock.loadProfile).toHaveBeenCalled();
  });

  describe('logout()', () => {
    it('should logout and navigate to home page on success', async () => {
      component.logout();
      await settleLogout();

      expect(logoutServiceMock.logoutUser).toHaveBeenCalled();
      expect(routingServiceMock.navigateToHomePage).toHaveBeenCalled();
    });

    it('should set isLogoutSubmitting while logout is in progress', () => {
      component.logout();

      expect(component.isLogoutSubmitting()).toBeTrue();
    });

    it('should not call logoutUser when already submitting', () => {
      component.logout();
      component.logout();

      expect(logoutServiceMock.logoutUser).toHaveBeenCalledTimes(1);
    });

    it('should show snackbar and reset submitting state when logout fails', async () => {
      const errorMessage = 'Logout fehlgeschlagen.';
      logoutServiceMock.logoutUser.and.returnValue(Promise.reject(new Error(errorMessage)));

      component.logout();
      await settleLogout();

      expect(component.isLogoutSubmitting()).toBeFalse();
      expect(component.isSnackbarOpen()).toBeTrue();
      expect(component.snackbarMessage()).toBe(errorMessage);
      expect(routingServiceMock.navigateToHomePage).not.toHaveBeenCalled();
    });

    it('should close snackbar when closeSnackbar is called', async () => {
      logoutServiceMock.logoutUser.and.returnValue(Promise.reject(new Error('error')));
      component.logout();
      await settleLogout();

      component.closeSnackbar();

      expect(component.isSnackbarOpen()).toBeFalse();
      expect(component.snackbarMessage()).toBe('');
    });
  });
});
