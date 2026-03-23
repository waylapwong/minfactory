import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';

@Component({
  selector: 'min-slider',
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
  imports: [],
})
export class SliderComponent {
  public readonly label: InputSignal<string> = input('');
  public readonly max: InputSignal<number> = input.required<number>();
  public readonly maxLabel: InputSignal<string> = input('');
  public readonly min: InputSignal<number> = input.required<number>();
  public readonly minLabel: InputSignal<string> = input('');
  public readonly step: InputSignal<number> = input(1);
  public readonly value: InputSignal<number> = input.required<number>();
  public readonly valueChange: OutputEmitterRef<number> = output<number>();

  public onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(Number(input.value));
  }
}
