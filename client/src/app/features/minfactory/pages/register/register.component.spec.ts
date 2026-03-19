import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/services/routing.service';
import { MinFactoryRegisterService } from '../../services/minfactory-register.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  const flushMicrotasks = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
  };

  const routingServiceMock = {
    navigateToHomePage: jasmine.createSpy('navigateToHomePage'),
  };

  const registerServiceMock = {
    registerUser: jasmine.createSpy('registerUser').and.returnValue(Promise.resolve()),
  };
  beforeEach(async () => {
    jasmine.clock().install();

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: RoutingService,
          useValue: routingServiceMock,
        },
        {
          provide: MinFactoryRegisterService,
          useValue: registerServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
    routingServiceMock.navigateToHomePage.calls.reset();
    registerServiceMock.registerUser.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit invalid form', () => {
    component.submitRegistration();

    expect(component.registerForm.invalid).toBeTrue();
    expect(registerServiceMock.registerUser).not.toHaveBeenCalled();
    expect(routingServiceMock.navigateToHomePage).not.toHaveBeenCalled();
  });

  it('should not submit when passwords do not match', () => {
    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');
    component.confirmPasswordControl.setValue('different');
    component.registerForm.markAllAsTouched();

    component.submitRegistration();

    expect(component.registerForm.invalid).toBeTrue();
    expect(registerServiceMock.registerUser).not.toHaveBeenCalled();
    expect(routingServiceMock.navigateToHomePage).not.toHaveBeenCalled();
  });

  it('should submit valid form and call register service', async () => {
    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');
    component.confirmPasswordControl.setValue('password123');

    component.submitRegistration();
    await flushMicrotasks();
    jasmine.clock().tick(800);

    expect(registerServiceMock.registerUser).toHaveBeenCalledWith('user@example.com', 'password123');
    expect(component.isSubmitting()).toBeFalse();
    expect(component.isSnackbarOpen()).toBeTrue();
    expect(routingServiceMock.navigateToHomePage).toHaveBeenCalled();
  });

  it('should display error message when register service fails', async () => {
    const errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.';
    registerServiceMock.registerUser.and.returnValue(Promise.reject(new Error(errorMessage)));

    component.emailControl.setValue('user@example.com');
    component.passwordControl.setValue('password123');
    component.confirmPasswordControl.setValue('password123');

    component.submitRegistration();
    await flushMicrotasks();

    expect(component.isSubmitting()).toBeFalse();
    expect(component.isSnackbarOpen()).toBeTrue();
    expect(component.snackbarMessage()).toBe(errorMessage);
    expect(routingServiceMock.navigateToHomePage).not.toHaveBeenCalled();
  });
});
