import { Component, InputSignal, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'min-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  imports: [ReactiveFormsModule],
})
export class InputComponent {
  public autocomplete: InputSignal<string> = input('');
  public formControlInput: InputSignal<FormControl> = input.required();
  public id: InputSignal<string> = input.required();
  public label: InputSignal<string> = input('');
  public maxLength: InputSignal<number> = input(100);
  public minLength: InputSignal<number> = input(0);
  public placeholder: InputSignal<string> = input('');
  public type: InputSignal<string> = input('text');

  public isFormControlInvalid(): boolean {
    return this.formControlInput().invalid && (this.formControlInput().touched || this.formControlInput().dirty);
  }
}
