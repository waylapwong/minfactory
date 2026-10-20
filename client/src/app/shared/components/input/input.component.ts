import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
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
  public isInvalid: InputSignal<boolean> = input(false);
  public label: InputSignal<string> = input('');
  public max: InputSignal<number | null> = input<number | null>(null);
  public maxLength: InputSignal<number> = input(100);
  public min: InputSignal<number | null> = input<number | null>(null);
  public minLength: InputSignal<number> = input(0);
  public placeholder: InputSignal<string> = input('');
  public showCharacterCount: InputSignal<boolean> = input(false);
  public type: InputSignal<string> = input('text');
  public valueChanged: OutputEmitterRef<Event> = output();

  public getCharacterCount(): number {
    const value = this.formControlInput().value;
    return typeof value === 'string' ? [...value].length : 0;
  }

  public isFormControlInvalid(): boolean {
    return (
      this.isInvalid() ||
      (this.formControlInput().invalid && (this.formControlInput().touched || this.formControlInput().dirty))
    );
  }
}
