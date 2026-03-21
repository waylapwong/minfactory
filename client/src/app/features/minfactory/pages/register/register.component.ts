import { Component, OnDestroy, WritableSignal, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { SnackbarComponent } from '../../../../shared/components/snackbar/snackbar.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinFactoryRegisterService } from '../../services/minfactory-register.service';

@Component({
  selector: 'minfactory-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  host: { class: 'block h-full w-full' },
  imports: [ReactiveFormsModule, CardComponent, H1Component, InputComponent, ButtonComponent, SnackbarComponent],
})
export class RegisterComponent implements OnDestroy {
  public readonly Color: typeof Color = Color;
  public readonly isSnackbarOpen: WritableSignal<boolean> = signal(false);
  public readonly isSubmitting: WritableSignal<boolean> = signal(false);
  public readonly registerForm: RegisterForm = new FormGroup(
    {
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: passwordsMatchValidator },
  );
  public readonly snackbarMessage: WritableSignal<string> = signal('');

  private redirectTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly routingService: RoutingService,
    private readonly registerService: MinFactoryRegisterService,
  ) {}

  public get confirmPasswordControl(): FormControl<string> {
    return this.registerForm.controls.confirmPassword;
  }

  public get emailControl(): FormControl<string> {
    return this.registerForm.controls.email;
  }

  public get passwordControl(): FormControl<string> {
    return this.registerForm.controls.password;
  }

  public ngOnDestroy(): void {
    this.clearRedirectTimeout();
  }

  public canSubmit(): boolean {
    return this.registerForm.valid && !this.isSubmitting();
  }

  public closeSnackbar(): void {
    this.isSnackbarOpen.set(false);
    this.snackbarMessage.set('');
  }

  public hasConfirmPasswordRequiredError(): boolean {
    return this.confirmPasswordControl.hasError('required') && this.isTouchedOrDirty(this.confirmPasswordControl);
  }

  public hasEmailFormatError(): boolean {
    return this.emailControl.hasError('email') && this.isTouchedOrDirty(this.emailControl);
  }

  public hasEmailRequiredError(): boolean {
    return this.emailControl.hasError('required') && this.isTouchedOrDirty(this.emailControl);
  }

  public hasPasswordMinLengthError(): boolean {
    return this.passwordControl.hasError('minlength') && this.isTouchedOrDirty(this.passwordControl);
  }

  public hasPasswordMismatchError(): boolean {
    return this.registerForm.hasError('passwordsMismatch') && this.isTouchedOrDirty(this.confirmPasswordControl);
  }

  public hasPasswordRequiredError(): boolean {
    return this.passwordControl.hasError('required') && this.isTouchedOrDirty(this.passwordControl);
  }

  public navigateToLogin(): void {
    this.routingService.navigateToLogin();
  }

  public submitRegistration(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.closeSnackbar();

    this.registerUser();
  }

  private clearRedirectTimeout(): void {
    if (this.redirectTimeoutId === null) {
      return;
    }

    clearTimeout(this.redirectTimeoutId);
    this.redirectTimeoutId = null;
  }

  private isTouchedOrDirty(control: FormControl<string>): boolean {
    return control.touched || control.dirty;
  }

  private async registerUser(): Promise<void> {
    try {
      const email = this.emailControl.value;
      const password = this.passwordControl.value;

      await this.registerService.registerUser(email, password);

      this.redirectTimeoutId = setTimeout(() => {
        this.isSubmitting.set(false);
        this.snackbarMessage.set('Account erfolgreich erstellt. Du wirst zur Startseite weitergeleitet.');
        this.isSnackbarOpen.set(true);
        this.registerForm.reset({ email: '', password: '', confirmPassword: '' });
        this.routingService.navigateToHomePage();
        this.redirectTimeoutId = null;
      }, 800);
    } catch (error) {
      this.isSubmitting.set(false);
      const errorMessage =
        error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
      this.snackbarMessage.set(errorMessage);
      this.isSnackbarOpen.set(true);
    }
  }
}

type RegisterForm = FormGroup<{
  confirmPassword: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
}>;

function passwordsMatchValidator(group: AbstractControl): { passwordsMismatch: true } | null {
  const form = group as RegisterForm;
  return form.controls.password.value === form.controls.confirmPassword.value ? null : { passwordsMismatch: true };
}
