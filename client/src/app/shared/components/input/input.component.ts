import { Component, InputSignal, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'min-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  imports: [ReactiveFormsModule],
})
export class InputComponent {
  public isDisabled: InputSignal<boolean> = input(false);
  public formControlInput: InputSignal<FormControl> = input.required();
  public id: InputSignal<string> = input.required();
  public label: InputSignal<string> = input('');
  public placeholder: InputSignal<string> = input('');
  public type: InputSignal<string> = input('text');

  public isFormControlInvalid(): boolean {
    return (
      this.formControlInput().invalid &&
      (this.formControlInput().touched || this.formControlInput().dirty)
    );
  }
}
