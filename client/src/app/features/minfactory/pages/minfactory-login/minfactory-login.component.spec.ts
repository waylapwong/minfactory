import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ROUTING_SERVICE_MOCK } from '../../../../core/routing/mocks/routing.service.mock';
import { RoutingService } from '../../../../core/routing/services/routing.service';
import { MINFACTORY_AUTHENTICATION_SERVICE_MOCK } from '../../mocks/minfactory-authentication.service.mock';
import { MinFactoryAuthenticationService } from '../../services/minfactory-authentication.service';
import { MinFactoryLoginComponent } from './minfactory-login.component';

describe('MinFactoryLoginComponent', () => {
  let component: MinFactoryLoginComponent;
  let fixture: ComponentFixture<MinFactoryLoginComponent>;

  const flushMicrotasks = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
  };

  const settleLogin = async (): Promise<void> => {
    const loginPromise: Promise<unknown> | undefined = MINFACTORY_AUTHENTICATION_SERVICE_MOCK.loginUser.calls.mostRecent()?.returnValue as
      | Promise<unknown>
      | undefined;

    try {
      await loginPromise;
    } catch {
      // Intentionally ignored for tests that assert failure behavior.
    }

    await flushMicrotasks();
  };

  beforeEach(async () => {
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.loginUser.calls.reset();
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.loginUser.and.callFake(
      async () => ({ email: 'user@example.com', createdAt: new Date() }) as any,
    );
    ROUTING_SERVICE_MOCK.navigateToProfile.calls.reset();
    ROUTING_SERVICE_MOCK.navigateToRegister.calls.reset();

    await TestBed.configureTestingModule({
      imports: [MinFactoryLoginComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: RoutingService, useValue: ROUTING_SERVICE_MOCK },
        { provide: MinFactoryAuthenticationService, useValue: MINFACTORY_AUTHENTICATION_SERVICE_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinFactoryLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit invalid form', () => {
    component.submitLogin();

    expect(component.loginForm.invalid).toBeTrue();
    expect(MINFACTORY_AUTHENTICATION_SERVICE_MOCK.loginUser).not.toHaveBeenCalled();
    expect(ROUTING_SERVICE_MOCK.navigateToProfile).not.toHaveBeenCalled();
  });

  it('should submit valid form and call login service', async () => {
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.loginUser.and.returnValue(Promise.resolve());

    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');

    component.submitLogin();
    await settleLogin();

    expect(MINFACTORY_AUTHENTICATION_SERVICE_MOCK.loginUser).toHaveBeenCalledWith('user@example.com', 'password123');
    expect(component.isSubmitting()).toBeTrue();
  });

  it('should display error message when login service fails', async () => {
    const errorMessage = 'Ungültige Anmeldedaten.';
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.loginUser.and.returnValue(Promise.reject(new Error(errorMessage)));

    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('wrongpassword');

    component.submitLogin();
    await settleLogin();

    expect(component.isSubmitting()).toBeFalse();
    expect(component.isSnackbarOpen()).toBeTrue();
    expect(component.snackbarMessage()).toBe(errorMessage);
    expect(ROUTING_SERVICE_MOCK.navigateToProfile).not.toHaveBeenCalled();
  });

  it('should navigate to register when navigateToRegister is called', () => {
    component.navigateToRegister();

    expect(ROUTING_SERVICE_MOCK.navigateToRegister).toHaveBeenCalled();
  });

  describe('canSubmit()', () => {
    it('should return true when form is valid and not submitting', () => {
      component.emailControl.setValue('user@example.com');
      component.passwordControl.setValue('password123');
      expect(component.canSubmit()).toBeTrue();
    });

    it('should return false when form is invalid', () => {
      expect(component.canSubmit()).toBeFalse();
    });

    it('should return false when already submitting', () => {
      component.emailControl.setValue('user@example.com');
      component.passwordControl.setValue('password123');
      component.isSubmitting.set(true);
      expect(component.canSubmit()).toBeFalse();
    });
  });

  describe('closeSnackbar()', () => {
    it('should close snackbar and clear message', () => {
      component.isSnackbarOpen.set(true);
      component.snackbarMessage.set('Some message');

      component.closeSnackbar();

      expect(component.isSnackbarOpen()).toBeFalse();
      expect(component.snackbarMessage()).toBe('');
    });
  });

  describe('hasEmailFormatError()', () => {
    it('should return true when email has format error and is touched', () => {
      component.emailControl.setValue('not-an-email');
      component.emailControl.markAsTouched();
      expect(component.hasEmailFormatError()).toBeTrue();
    });

    it('should return false when email is not touched', () => {
      component.emailControl.setValue('not-an-email');
      expect(component.hasEmailFormatError()).toBeFalse();
    });

    it('should return false when email is valid', () => {
      component.emailControl.setValue('valid@example.com');
      component.emailControl.markAsTouched();
      expect(component.hasEmailFormatError()).toBeFalse();
    });
  });

  describe('hasEmailRequiredError()', () => {
    it('should return true when email is empty and dirty', () => {
      component.emailControl.markAsDirty();
      expect(component.hasEmailRequiredError()).toBeTrue();
    });

    it('should return false when email has value', () => {
      component.emailControl.setValue('user@example.com');
      component.emailControl.markAsTouched();
      expect(component.hasEmailRequiredError()).toBeFalse();
    });
  });

  describe('hasPasswordRequiredError()', () => {
    it('should return true when password is empty and touched', () => {
      component.passwordControl.markAsTouched();
      expect(component.hasPasswordRequiredError()).toBeTrue();
    });

    it('should return false when password has value', () => {
      component.passwordControl.setValue('abc');
      component.passwordControl.markAsTouched();
      expect(component.hasPasswordRequiredError()).toBeFalse();
    });
  });

  describe('ngOnDestroy()', () => {
    it('should clear redirect timeout on destroy', async () => {
      jasmine.clock().install();
      MINFACTORY_AUTHENTICATION_SERVICE_MOCK.loginUser.and.returnValue(Promise.resolve());

      component.emailControl.setValue('user@example.com');
      component.passwordControl.setValue('password123');
      component.submitLogin();
      await settleLogin();

      component.ngOnDestroy();

      // no error on clock tick means timeout was cleared
      jasmine.clock().tick(1000);
      jasmine.clock().uninstall();
    });

    it('should not throw when redirectTimeoutId is null', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  it('should not double-submit when already submitting', async () => {
    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');

    component.submitLogin();
    component.submitLogin();

    expect(MINFACTORY_AUTHENTICATION_SERVICE_MOCK.loginUser).toHaveBeenCalledTimes(1);
    await settleLogin();
  });

  it('should show fallback error message when login rejects with non-Error', async () => {
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.loginUser.and.rejectWith('unexpected');

    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');
    component.submitLogin();
    await settleLogin();

    expect(component.snackbarMessage()).toBe('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
  });
});
