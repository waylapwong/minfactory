import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/services/routing.service';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  const routingServiceMock = {
    navigateToHomePage: jasmine.createSpy('navigateToHomePage'),
  };

  const authServiceMock = {
    registerWithEmailAndPassword: jasmine.createSpy('registerWithEmailAndPassword').and.returnValue(Promise.resolve()),
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: RoutingService,
          useValue: routingServiceMock,
        },
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    routingServiceMock.navigateToHomePage.calls.reset();
    authServiceMock.registerWithEmailAndPassword.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit invalid form', () => {
    component.submitRegistration();

    expect(component.registerForm.invalid).toBeTrue();
    expect(authServiceMock.registerWithEmailAndPassword).not.toHaveBeenCalled();
    expect(routingServiceMock.navigateToHomePage).not.toHaveBeenCalled();
  });

  it('should not submit when passwords do not match', () => {
    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');
    component.confirmPasswordControl.setValue('different');
    component.registerForm.markAllAsTouched();

    component.submitRegistration();

    expect(component.registerForm.invalid).toBeTrue();
    expect(authServiceMock.registerWithEmailAndPassword).not.toHaveBeenCalled();
    expect(routingServiceMock.navigateToHomePage).not.toHaveBeenCalled();
  });

  it('should submit valid form and call Firebase registration', async () => {
    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');
    component.confirmPasswordControl.setValue('password123');

    spyOn(window, 'setTimeout').and.callFake((handler: TimerHandler) => {
      if (typeof handler === 'function') {
        handler();
      }
      return 1 as unknown as ReturnType<typeof setTimeout>;
    });

    component.submitRegistration();
      // Give time for async registration to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

    expect(authServiceMock.registerWithEmailAndPassword).toHaveBeenCalledWith('user@example.com', 'password123');
    expect(component.isSubmitting()).toBeFalse();
    expect(component.isSnackbarOpen()).toBeTrue();
    expect(routingServiceMock.navigateToHomePage).toHaveBeenCalled();
  });

  it('should display error message when Firebase registration fails', async () => {
    const errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.';
    authServiceMock.registerWithEmailAndPassword.and.returnValue(Promise.reject(new Error(errorMessage)));

    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');
    component.confirmPasswordControl.setValue('password123');

    component.submitRegistration();
      // Give time for async registration to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

    expect(component.isSubmitting()).toBeFalse();
    expect(component.isSnackbarOpen()).toBeTrue();
    expect(component.snackbarMessage()).toBe(errorMessage);
    expect(routingServiceMock.navigateToHomePage).not.toHaveBeenCalled();
  });
});
