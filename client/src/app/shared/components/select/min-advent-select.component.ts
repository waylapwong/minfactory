import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectOption } from './select.component';

@Component({
  selector: 'min-advent-select',
  templateUrl: './min-advent-select.component.html',
  imports: [ReactiveFormsModule],
})
export class MinAdventSelectComponent {
  public readonly formControlInput: InputSignal<FormControl> = input.required();
  public readonly id: InputSignal<string> = input.required();
  public readonly label: InputSignal<string> = input('');
  public readonly options: InputSignal<readonly SelectOption[]> = input.required();
  public readonly valueChanged: OutputEmitterRef<string> = output();

  public isInvalid(): boolean {
    const control = this.formControlInput();
    return control.invalid && (control.touched || control.dirty);
  }

  public emitValueChanged(event: Event): void {
    this.valueChanged.emit((event.target as HTMLSelectElement).value);
  }
}
