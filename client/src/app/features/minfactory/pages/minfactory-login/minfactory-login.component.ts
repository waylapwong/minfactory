import { Component, OnDestroy, WritableSignal, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { SnackbarComponent } from '../../../../shared/components/snackbar/snackbar.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinFactoryLoginService } from '../../services/minfactory-login.service';

@Component({
  selector: 'minfactory-login',
  templateUrl: './minfactory-login.component.html',
  styleUrl: './minfactory-login.component.scss',
  host: { class: 'block h-full w-full' },
  imports: [ReactiveFormsModule, CardComponent, H1Component, InputComponent, ButtonComponent, SnackbarComponent],
})
export class MinFactoryLoginComponent implements OnDestroy {
  public readonly Color: typeof Color = Color;
  public readonly isSnackbarOpen: WritableSignal<boolean> = signal(false);
  public readonly isSubmitting: WritableSignal<boolean> = signal(false);
  public readonly loginForm: LoginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  public readonly snackbarMessage: WritableSignal<string> = signal('');

  private redirectTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly routingService: RoutingService,
    private readonly loginService: MinFactoryLoginService,
  ) {}

  public get emailControl(): FormControl<string> {
    return this.loginForm.controls.email;
  }

  public get passwordControl(): FormControl<string> {
    return this.loginForm.controls.password;
  }

  public ngOnDestroy(): void {
    this.clearRedirectTimeout();
  }

  public canSubmit(): boolean {
    return this.loginForm.valid && !this.isSubmitting();
  }

  public closeSnackbar(): void {
    this.isSnackbarOpen.set(false);
    this.snackbarMessage.set('');
  }

  public hasEmailFormatError(): boolean {
    return this.emailControl.hasError('email') && this.isTouchedOrDirty(this.emailControl);
  }

  public hasEmailRequiredError(): boolean {
    return this.emailControl.hasError('required') && this.isTouchedOrDirty(this.emailControl);
  }

  public hasPasswordRequiredError(): boolean {
    return this.passwordControl.hasError('required') && this.isTouchedOrDirty(this.passwordControl);
  }

  public navigateToRegister(): void {
    this.routingService.navigateToRegister();
  }

  public submitLogin(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.closeSnackbar();

    this.loginUser();
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

  private async loginUser(): Promise<void> {
    try {
      const email = this.emailControl.value;
      const password = this.passwordControl.value;

      await this.loginService.loginUser(email, password);

      this.redirectTimeoutId = setTimeout(() => {
        this.isSubmitting.set(false);
        this.snackbarMessage.set('Erfolgreich eingeloggt.');
        this.isSnackbarOpen.set(true);
        this.loginForm.reset({ email: '', password: '' });
        this.routingService.navigateToProfile();
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

type LoginForm = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
}>;
