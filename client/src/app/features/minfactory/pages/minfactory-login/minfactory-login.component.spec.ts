import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/routing/routing.service';
import { MinFactoryAuthenticationService } from '../../services/minfactory-authentication.service';
import { MINFACTORY_AUTHENTICATION_SERVICE_MOCK } from '../../services/minfactory-authentication.service.mock';
import { MINFACTORY_ROUTING_SERVICE_MOCK } from '../../services/minfactory-routing.service.mock';
import { MinFactoryLoginComponent } from './minfactory-login.component';

describe('MinFactoryLoginComponent', () => {
  let component: MinFactoryLoginComponent;
  let fixture: ComponentFixture<MinFactoryLoginComponent>;

  const flushMicrotasks = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
  };

  const settleLogin = async (): Promise<void> => {
    const loginPromise: Promise<unknown> | undefined =
      MINFACTORY_AUTHENTICATION_SERVICE_MOCK.loginUser.calls.mostRecent()?.returnValue as
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
    MINFACTORY_ROUTING_SERVICE_MOCK.navigateToProfile.calls.reset();
    MINFACTORY_ROUTING_SERVICE_MOCK.navigateToRegister.calls.reset();

    await TestBed.configureTestingModule({
      imports: [MinFactoryLoginComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: RoutingService, useValue: MINFACTORY_ROUTING_SERVICE_MOCK },
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
    expect(MINFACTORY_ROUTING_SERVICE_MOCK.navigateToProfile).not.toHaveBeenCalled();
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
    expect(MINFACTORY_ROUTING_SERVICE_MOCK.navigateToProfile).not.toHaveBeenCalled();
  });

  it('should navigate to register when navigateToRegister is called', () => {
    component.navigateToRegister();

    expect(MINFACTORY_ROUTING_SERVICE_MOCK.navigateToRegister).toHaveBeenCalled();
  });
});
