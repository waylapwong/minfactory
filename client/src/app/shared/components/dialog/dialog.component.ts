import { Component, HostListener, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { Color } from '../../enums/color.enum';
import { ButtonComponent } from '../button/button.component';
import { H2Component } from '../h2/h2.component';

@Component({
  selector: 'min-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  imports: [ButtonComponent, H2Component],
})
export class DialogComponent {
  public readonly Color: typeof Color = Color;

  public closed: OutputEmitterRef<void> = output();
  public isOpen: InputSignal<boolean> = input(false);
  public size: InputSignal<'default' | 'wide'> = input<'default' | 'wide'>('default');
  public title: InputSignal<string> = input('');

  public emitClosed(): void {
    this.closed.emit();
  }

  @HostListener('document:keydown.escape', ['$event'])
  public closeOnEscape(event: Event): void {
    if (this.isOpen()) {
      event.preventDefault();
      this.emitClosed();
    }
  }
}
