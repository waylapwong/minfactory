import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ROUTING_SERVICE_MOCK } from '../../../../core/mocks/routing.service.mock';
import { MinFactoryAuthenticationService } from '../../services/minfactory-authentication.service';
import { MINFACTORY_AUTHENTICATION_SERVICE_MOCK } from '../../mocks/minfactory-authentication.service.mock';
import { MINFACTORY_USER_SERVICE_MOCK } from '../../mocks/minfactory-user.service.mock';
import { MinFactoryUserService } from '../../services/minfactory-user.service';
import { MinFactoryProfileComponent } from './minfactory-profile.component';

describe('MinFactoryProfileComponent', () => {
  let component: MinFactoryProfileComponent;
  let fixture: ComponentFixture<MinFactoryProfileComponent>;

  const flushMicrotasks = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
  };

  const settleLogout = async (): Promise<void> => {
    const logoutPromise: Promise<unknown> | undefined =
      MINFACTORY_AUTHENTICATION_SERVICE_MOCK.logoutUser.calls.mostRecent()?.returnValue as Promise<unknown> | undefined;

    try {
      await logoutPromise;
    } catch {
      // Intentionally ignored for tests that assert failure behavior.
    }

    await flushMicrotasks();
  };

  beforeEach(async () => {
    MINFACTORY_USER_SERVICE_MOCK.setProfile.calls.reset();
    MINFACTORY_USER_SERVICE_MOCK.clearProfileCache.calls.reset();
    MINFACTORY_USER_SERVICE_MOCK.clearProfileCache();
    MINFACTORY_USER_SERVICE_MOCK.loadProfile.calls.reset();
    MINFACTORY_USER_SERVICE_MOCK.loadProfile.and.callFake(async (): Promise<void> => {
      MINFACTORY_USER_SERVICE_MOCK.setProfile({
        createdAt: '19.03.2026, 11:00',
        email: 'user@example.com',
      });
    });
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.deleteAccount.calls.reset();
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.deleteAccount.and.resolveTo();
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.logoutUser.calls.reset();
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.logoutUser.and.resolveTo();
    ROUTING_SERVICE_MOCK.navigateToLogin.calls.reset();
    ROUTING_SERVICE_MOCK.navigateToHomePage.calls.reset();
    ROUTING_SERVICE_MOCK.navigateToApps.calls.reset();

    await TestBed.configureTestingModule({
      imports: [MinFactoryProfileComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinFactoryUserService, useValue: MINFACTORY_USER_SERVICE_MOCK },
        { provide: MinFactoryAuthenticationService, useValue: MINFACTORY_AUTHENTICATION_SERVICE_MOCK },
        { provide: RoutingService, useValue: ROUTING_SERVICE_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinFactoryProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(MINFACTORY_USER_SERVICE_MOCK.loadProfile).toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
    expect(component.isError()).toBeFalse();
  });

  it('should navigate to login when profile loading fails with unauthorized error', async () => {
    MINFACTORY_USER_SERVICE_MOCK.loadProfile.and.returnValue(Promise.reject(new Error('401 Unauthorized')));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(ROUTING_SERVICE_MOCK.navigateToLogin).toHaveBeenCalled();
  });

  it('should expose error state when profile loading fails', async () => {
    MINFACTORY_USER_SERVICE_MOCK.loadProfile.and.returnValue(Promise.reject(new Error('Server down')));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isError()).toBeTrue();
    expect(component.errorMessage()).toBe('Server down');
    expect(MINFACTORY_USER_SERVICE_MOCK.clearProfileCache).toHaveBeenCalled();
  });

  it('should navigate to apps', () => {
    component.navigateToApps();

    expect(ROUTING_SERVICE_MOCK.navigateToApps).toHaveBeenCalled();
  });

  it('should reload profile when reloadProfile is called', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    MINFACTORY_USER_SERVICE_MOCK.loadProfile.calls.reset();

    component.reloadProfile();
    await fixture.whenStable();

    expect(MINFACTORY_USER_SERVICE_MOCK.loadProfile).toHaveBeenCalled();
  });

  describe('logout()', () => {
    it('should logout and navigate to home page on success', async () => {
      component.logout();
      await settleLogout();

      expect(MINFACTORY_AUTHENTICATION_SERVICE_MOCK.logoutUser).toHaveBeenCalled();
      expect(ROUTING_SERVICE_MOCK.navigateToHomePage).toHaveBeenCalled();
    });

    it('should set isLogoutSubmitting while logout is in progress', () => {
      component.logout();

      expect(component.isLogoutSubmitting()).toBeTrue();
    });

    it('should not call logoutUser when already submitting', () => {
      component.logout();
      component.logout();

      expect(MINFACTORY_AUTHENTICATION_SERVICE_MOCK.logoutUser).toHaveBeenCalledTimes(1);
    });

    it('should show snackbar and reset submitting state when logout fails', async () => {
      const errorMessage = 'Logout fehlgeschlagen.';
      MINFACTORY_AUTHENTICATION_SERVICE_MOCK.logoutUser.and.returnValue(Promise.reject(new Error(errorMessage)));

      component.logout();
      await settleLogout();

      expect(component.isLogoutSubmitting()).toBeFalse();
      expect(component.isSnackbarOpen()).toBeTrue();
      expect(component.snackbarMessage()).toBe(errorMessage);
      expect(ROUTING_SERVICE_MOCK.navigateToHomePage).not.toHaveBeenCalled();
    });

    it('should close snackbar when closeSnackbar is called', async () => {
      MINFACTORY_AUTHENTICATION_SERVICE_MOCK.logoutUser.and.returnValue(Promise.reject(new Error('error')));
      component.logout();
      await settleLogout();

      component.closeSnackbar();

      expect(component.isSnackbarOpen()).toBeFalse();
      expect(component.snackbarMessage()).toBe('');
    });
  });

  describe('deleteAccount', () => {
    const settleDeleteAccount = async (): Promise<void> => {
      const deletePromise: Promise<unknown> | undefined =
        MINFACTORY_AUTHENTICATION_SERVICE_MOCK.deleteAccount.calls.mostRecent()?.returnValue as
          | Promise<unknown>
          | undefined;

      try {
        await deletePromise;
      } catch {
        // Intentionally ignored for tests that assert failure behavior.
      }

      await flushMicrotasks();
    };

    it('should open delete dialog when openDeleteDialog is called', () => {
      component.openDeleteDialog();

      expect(component.isDeleteDialogOpen()).toBeTrue();
    });

    it('should close delete dialog when cancelDeleteAccount is called', () => {
      component.openDeleteDialog();
      component.cancelDeleteAccount();

      expect(component.isDeleteDialogOpen()).toBeFalse();
    });

    it('should delete account and navigate to home page on success', async () => {
      component.confirmDeleteAccount();
      await settleDeleteAccount();

      expect(MINFACTORY_AUTHENTICATION_SERVICE_MOCK.deleteAccount).toHaveBeenCalled();
      expect(component.isDeleteSubmitting()).toBeFalse();
      expect(ROUTING_SERVICE_MOCK.navigateToHomePage).toHaveBeenCalled();
    });

    it('should close dialog before deleting account', () => {
      component.openDeleteDialog();
      component.confirmDeleteAccount();

      expect(component.isDeleteDialogOpen()).toBeFalse();
    });

    it('should set isDeleteSubmitting while deletion is in progress', () => {
      component.confirmDeleteAccount();

      expect(component.isDeleteSubmitting()).toBeTrue();
    });

    it('should show snackbar and reset submitting state when delete fails', async () => {
      const errorMessage = 'Löschen fehlgeschlagen.';
      MINFACTORY_AUTHENTICATION_SERVICE_MOCK.deleteAccount.and.returnValue(Promise.reject(new Error(errorMessage)));

      component.confirmDeleteAccount();
      await settleDeleteAccount();

      expect(component.isDeleteSubmitting()).toBeFalse();
      expect(component.isSnackbarOpen()).toBeTrue();
      expect(component.snackbarMessage()).toBe(errorMessage);
      expect(ROUTING_SERVICE_MOCK.navigateToHomePage).not.toHaveBeenCalled();
    });
  });
});
