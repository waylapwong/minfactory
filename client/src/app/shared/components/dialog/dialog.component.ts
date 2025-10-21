import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';

import { Color } from '../../enums/color.enum';
import { ButtonComponent } from '../button/button.component';
import { H1Component } from '../h1/h1.component';

@Component({
  selector: 'min-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  imports: [ButtonComponent, H1Component],
})
export class DialogComponent {
  public readonly Color: typeof Color = Color;

  public closed: OutputEmitterRef<void> = output();
  public isOpen: InputSignal<boolean> = input(false);
  public title: InputSignal<string> = input('');

  public emitClosed(): void {
    this.closed.emit();
  }
}
