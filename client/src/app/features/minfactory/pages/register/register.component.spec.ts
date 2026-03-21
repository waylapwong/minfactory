import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/routing/routing.service';
import { MinFactoryRegisterService } from '../../services/minfactory-register.service';
import { MINFACTORY_REGISTER_SERVICE_MOCK } from '../../services/minfactory-register.service.mock';
import { MINFACTORY_ROUTING_SERVICE_MOCK } from '../../services/minfactory-routing.service.mock';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  const flushMicrotasks = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
  };

  const settleRegistration = async (): Promise<void> => {
    const registerPromise: Promise<unknown> | undefined =
      MINFACTORY_REGISTER_SERVICE_MOCK.registerUser.calls.mostRecent()?.returnValue as Promise<unknown> | undefined;

    try {
      await registerPromise;
    } catch {
      // Intentionally ignored for tests that assert failure behavior.
    }

    await flushMicrotasks();
  };

  beforeEach(async () => {
    MINFACTORY_REGISTER_SERVICE_MOCK.registerUser.calls.reset();
    MINFACTORY_REGISTER_SERVICE_MOCK.registerUser.and.callFake(
      async () => ({ email: 'user@example.com', createdAt: new Date() }) as any,
    );
    MINFACTORY_ROUTING_SERVICE_MOCK.navigateToHomePage.calls.reset();
    MINFACTORY_ROUTING_SERVICE_MOCK.navigateToLogin.calls.reset();

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: RoutingService, useValue: MINFACTORY_ROUTING_SERVICE_MOCK },
        { provide: MinFactoryRegisterService, useValue: MINFACTORY_REGISTER_SERVICE_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit invalid form', () => {
    component.submitRegistration();

    expect(component.registerForm.invalid).toBeTrue();
    expect(MINFACTORY_REGISTER_SERVICE_MOCK.registerUser).not.toHaveBeenCalled();
    expect(MINFACTORY_ROUTING_SERVICE_MOCK.navigateToHomePage).not.toHaveBeenCalled();
  });

  it('should not submit when passwords do not match', () => {
    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');
    component.confirmPasswordControl.setValue('different');
    component.registerForm.markAllAsTouched();

    component.submitRegistration();

    expect(component.registerForm.invalid).toBeTrue();
    expect(MINFACTORY_REGISTER_SERVICE_MOCK.registerUser).not.toHaveBeenCalled();
    expect(MINFACTORY_ROUTING_SERVICE_MOCK.navigateToHomePage).not.toHaveBeenCalled();
  });

  it('should submit valid form and call register service', async () => {
    MINFACTORY_REGISTER_SERVICE_MOCK.registerUser.and.returnValue(Promise.resolve());

    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');
    component.confirmPasswordControl.setValue('password123');

    component.submitRegistration();
    await settleRegistration();

    expect(MINFACTORY_REGISTER_SERVICE_MOCK.registerUser).toHaveBeenCalledWith('user@example.com', 'password123');
    expect(component.isSubmitting()).toBeTrue();
  });

  it('should display error message when register service fails', async () => {
    const errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.';
    MINFACTORY_REGISTER_SERVICE_MOCK.registerUser.and.returnValue(Promise.reject(new Error(errorMessage)));

    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');
    component.confirmPasswordControl.setValue('password123');

    component.submitRegistration();
    await settleRegistration();

    expect(component.isSubmitting()).toBeFalse();
    expect(component.isSnackbarOpen()).toBeTrue();
    expect(component.snackbarMessage()).toBe(errorMessage);
    expect(MINFACTORY_ROUTING_SERVICE_MOCK.navigateToHomePage).not.toHaveBeenCalled();
  });

  it('should navigate to login when navigateToLogin is called', () => {
    component.navigateToLogin();

    expect(MINFACTORY_ROUTING_SERVICE_MOCK.navigateToLogin).toHaveBeenCalled();
  });
});
