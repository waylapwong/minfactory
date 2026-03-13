import { Component, InputSignal, OnDestroy, OutputEmitterRef, effect, input, output } from '@angular/core';

@Component({
  selector: 'min-snackbar',
  imports: [],
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
})
export class SnackbarComponent implements OnDestroy {
  private readonly autoCloseEffect = effect(() => {
    if (!this.isOpen() || !this.message()) {
      this.clearAutoCloseTimeout();
      return;
    }
    this.clearAutoCloseTimeout();
    this.timeoutId = setTimeout(() => {
      this.closed.emit();
    }, 3000);
  });

  public closed: OutputEmitterRef<void> = output();
  public isOpen: InputSignal<boolean> = input(false);
  public message: InputSignal<string> = input('');

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  public ngOnDestroy(): void {
    this.clearAutoCloseTimeout();
    this.autoCloseEffect.destroy();
  }

  public emitClosed(): void {
    this.closed.emit();
  }

  private clearAutoCloseTimeout(): void {
    if (this.timeoutId === null) {
      return;
    }

    clearTimeout(this.timeoutId);
    this.timeoutId = null;
  }
}
