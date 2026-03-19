import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/services/routing.service';
import { MinFactoryLoginService } from '../../services/minfactory-login.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  const flushMicrotasks = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
  };

  const settleLogin = async (): Promise<void> => {
    const loginPromise: Promise<unknown> | undefined = loginServiceMock.loginUser.calls.mostRecent()
      ?.returnValue as Promise<unknown> | undefined;

    try {
      await loginPromise;
    } catch {
      // Intentionally ignored for tests that assert failure behavior.
    }

    await flushMicrotasks();
  };

  const routingServiceMock = {
    navigateToApps: jasmine.createSpy('navigateToApps'),
    navigateToRegister: jasmine.createSpy('navigateToRegister'),
  };

  const loginServiceMock = {
    loginUser: jasmine.createSpy('loginUser').and.returnValue(Promise.resolve()),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: RoutingService,
          useValue: routingServiceMock,
        },
        {
          provide: MinFactoryLoginService,
          useValue: loginServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    routingServiceMock.navigateToApps.calls.reset();
    routingServiceMock.navigateToRegister.calls.reset();
    loginServiceMock.loginUser.calls.reset();
    loginServiceMock.loginUser.and.returnValue(Promise.resolve());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit invalid form', () => {
    component.submitLogin();

    expect(component.loginForm.invalid).toBeTrue();
    expect(loginServiceMock.loginUser).not.toHaveBeenCalled();
    expect(routingServiceMock.navigateToApps).not.toHaveBeenCalled();
  });

  it('should submit valid form and call login service', async () => {
    loginServiceMock.loginUser.and.returnValue(Promise.resolve());

    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');

    component.submitLogin();
    await settleLogin();

    expect(loginServiceMock.loginUser).toHaveBeenCalledWith('user@example.com', 'password123');
    expect(component.isSubmitting()).toBeTrue();
  });

  it('should display error message when login service fails', async () => {
    const errorMessage = 'Ungültige Anmeldedaten.';
    loginServiceMock.loginUser.and.returnValue(Promise.reject(new Error(errorMessage)));

    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('wrongpassword');

    component.submitLogin();
    await settleLogin();

    expect(component.isSubmitting()).toBeFalse();
    expect(component.isSnackbarOpen()).toBeTrue();
    expect(component.snackbarMessage()).toBe(errorMessage);
    expect(routingServiceMock.navigateToApps).not.toHaveBeenCalled();
  });

  it('should navigate to register when navigateToRegister is called', () => {
    component.navigateToRegister();

    expect(routingServiceMock.navigateToRegister).toHaveBeenCalled();
  });
});
