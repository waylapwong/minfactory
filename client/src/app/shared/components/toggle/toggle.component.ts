import { Component, InputSignal, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'min-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  imports: [ReactiveFormsModule],
})
export class ToggleComponent {
  public formControlInput: InputSignal<FormControl<boolean>> = input.required();
  public id: InputSignal<string> = input.required();
  public label: InputSignal<string> = input('');
  public labelLeft: InputSignal<string> = input.required();
  public labelRight: InputSignal<string> = input.required();

  public setValue(value: boolean): void {
    if (!this.formControlInput().disabled) {
      this.formControlInput().setValue(value);
      this.formControlInput().markAsDirty();
      this.formControlInput().markAsTouched();
    }
  }
}
