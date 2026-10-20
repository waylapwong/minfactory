import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'min-textarea',
  templateUrl: './textarea.component.html',
  imports: [ReactiveFormsModule],
})
export class TextareaComponent {
  public formControlInput: InputSignal<FormControl> = input.required();
  public id: InputSignal<string> = input.required();
  public isInvalid: InputSignal<boolean> = input(false);
  public label: InputSignal<string> = input('');
  public maxLength: InputSignal<number> = input(100);
  public rows: InputSignal<number> = input(4);
  public showCharacterCount: InputSignal<boolean> = input(false);
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
