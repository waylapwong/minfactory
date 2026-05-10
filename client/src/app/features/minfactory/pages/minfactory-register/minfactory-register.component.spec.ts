import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ROUTING_SERVICE_MOCK } from '../../../../core/routing/mocks/routing.service.mock';
import { RoutingService } from '../../../../core/routing/services/routing.service';
import { MINFACTORY_AUTHENTICATION_SERVICE_MOCK } from '../../mocks/minfactory-authentication.service.mock';
import { MinFactoryAuthenticationService } from '../../services/minfactory-authentication.service';
import { MinFactoryRegisterComponent } from './minfactory-register.component';

describe('MinFactoryRegisterComponent', () => {
  let component: MinFactoryRegisterComponent;
  let fixture: ComponentFixture<MinFactoryRegisterComponent>;

  const flushMicrotasks = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
  };

  const settleRegistration = async (): Promise<void> => {
    const registerPromise: Promise<unknown> | undefined = MINFACTORY_AUTHENTICATION_SERVICE_MOCK.registerUser.calls.mostRecent()
      ?.returnValue as Promise<unknown> | undefined;

    try {
      await registerPromise;
    } catch {
      // Intentionally ignored for tests that assert failure behavior.
    }

    await flushMicrotasks();
  };

  beforeEach(async () => {
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.registerUser.calls.reset();
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.registerUser.and.callFake(
      async () => ({ email: 'user@example.com', createdAt: new Date() }) as any,
    );
    ROUTING_SERVICE_MOCK.navigateToHomePage.calls.reset();
    ROUTING_SERVICE_MOCK.navigateToLogin.calls.reset();

    await TestBed.configureTestingModule({
      imports: [MinFactoryRegisterComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: RoutingService, useValue: ROUTING_SERVICE_MOCK },
        { provide: MinFactoryAuthenticationService, useValue: MINFACTORY_AUTHENTICATION_SERVICE_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinFactoryRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit invalid form', () => {
    component.submitRegistration();

    expect(component.registerForm.invalid).toBeTrue();
    expect(MINFACTORY_AUTHENTICATION_SERVICE_MOCK.registerUser).not.toHaveBeenCalled();
    expect(ROUTING_SERVICE_MOCK.navigateToHomePage).not.toHaveBeenCalled();
  });

  it('should not submit when passwords do not match', () => {
    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');
    component.confirmPasswordControl.setValue('different');
    component.registerForm.markAllAsTouched();

    component.submitRegistration();

    expect(component.registerForm.invalid).toBeTrue();
    expect(MINFACTORY_AUTHENTICATION_SERVICE_MOCK.registerUser).not.toHaveBeenCalled();
    expect(ROUTING_SERVICE_MOCK.navigateToHomePage).not.toHaveBeenCalled();
  });

  it('should submit valid form and call register service', async () => {
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.registerUser.and.returnValue(Promise.resolve());

    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');
    component.confirmPasswordControl.setValue('password123');

    component.submitRegistration();
    await settleRegistration();

    expect(MINFACTORY_AUTHENTICATION_SERVICE_MOCK.registerUser).toHaveBeenCalledWith('user@example.com', 'password123');
    expect(component.isSubmitting()).toBeTrue();
  });

  it('should display error message when register service fails', async () => {
    const errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.';
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.registerUser.and.returnValue(Promise.reject(new Error(errorMessage)));

    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');
    component.confirmPasswordControl.setValue('password123');

    component.submitRegistration();
    await settleRegistration();

    expect(component.isSubmitting()).toBeFalse();
    expect(component.isSnackbarOpen()).toBeTrue();
    expect(component.snackbarMessage()).toBe(errorMessage);
    expect(ROUTING_SERVICE_MOCK.navigateToHomePage).not.toHaveBeenCalled();
  });

  it('should navigate to login when navigateToLogin is called', () => {
    component.navigateToLogin();

    expect(ROUTING_SERVICE_MOCK.navigateToLogin).toHaveBeenCalled();
  });

  describe('canSubmit()', () => {
    it('should return true when form is valid and not submitting', () => {
      component.emailControl.setValue('user@example.com');
      component.passwordControl.setValue('password123');
      component.confirmPasswordControl.setValue('password123');
      expect(component.canSubmit()).toBeTrue();
    });

    it('should return false when form is invalid', () => {
      expect(component.canSubmit()).toBeFalse();
    });

    it('should return false when already submitting', () => {
      component.emailControl.setValue('user@example.com');
      component.passwordControl.setValue('password123');
      component.confirmPasswordControl.setValue('password123');
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

  describe('hasConfirmPasswordRequiredError()', () => {
    it('should return true when confirmPassword is empty and touched', () => {
      component.confirmPasswordControl.markAsTouched();
      expect(component.hasConfirmPasswordRequiredError()).toBeTrue();
    });

    it('should return false when confirmPassword has value', () => {
      component.confirmPasswordControl.setValue('abc');
      component.confirmPasswordControl.markAsTouched();
      expect(component.hasConfirmPasswordRequiredError()).toBeFalse();
    });
  });

  describe('hasEmailFormatError()', () => {
    it('should return true when email is invalid and touched', () => {
      component.emailControl.setValue('not-an-email');
      component.emailControl.markAsTouched();
      expect(component.hasEmailFormatError()).toBeTrue();
    });

    it('should return false when not touched', () => {
      component.emailControl.setValue('not-an-email');
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

  describe('hasPasswordMinLengthError()', () => {
    it('should return true when password is too short and dirty', () => {
      component.passwordControl.setValue('short');
      component.passwordControl.markAsDirty();
      expect(component.hasPasswordMinLengthError()).toBeTrue();
    });

    it('should return false when password meets min length', () => {
      component.passwordControl.setValue('longpass');
      component.passwordControl.markAsDirty();
      expect(component.hasPasswordMinLengthError()).toBeFalse();
    });
  });

  describe('hasPasswordMismatchError()', () => {
    it('should return true when passwords do not match and confirmPassword is touched', () => {
      component.passwordControl.setValue('password123');
      component.confirmPasswordControl.setValue('different');
      component.confirmPasswordControl.markAsTouched();
      expect(component.hasPasswordMismatchError()).toBeTrue();
    });

    it('should return false when passwords match', () => {
      component.passwordControl.setValue('password123');
      component.confirmPasswordControl.setValue('password123');
      component.confirmPasswordControl.markAsTouched();
      expect(component.hasPasswordMismatchError()).toBeFalse();
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
    it('should not throw when redirectTimeoutId is null', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should clear redirect timeout on destroy', async () => {
      jasmine.clock().install();
      MINFACTORY_AUTHENTICATION_SERVICE_MOCK.registerUser.and.returnValue(Promise.resolve());

      component.emailControl.setValue('user@example.com');
      component.passwordControl.setValue('password123');
      component.confirmPasswordControl.setValue('password123');
      component.submitRegistration();
      await settleRegistration();

      component.ngOnDestroy();
      jasmine.clock().tick(1000);
      jasmine.clock().uninstall();
    });
  });

  it('should not double-submit when already submitting', async () => {
    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');
    component.confirmPasswordControl.setValue('password123');

    component.submitRegistration();
    component.submitRegistration();

    expect(MINFACTORY_AUTHENTICATION_SERVICE_MOCK.registerUser).toHaveBeenCalledTimes(1);
    await settleRegistration();
  });

  it('should show fallback error message when registration rejects with non-Error', async () => {
    MINFACTORY_AUTHENTICATION_SERVICE_MOCK.registerUser.and.rejectWith('unexpected');

    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');
    component.confirmPasswordControl.setValue('password123');
    component.submitRegistration();
    await settleRegistration();

    expect(component.snackbarMessage()).toBe('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
  });
});
