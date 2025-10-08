import {
  Component,
  InputSignal,
  OutputEmitterRef,
  Signal,
  computed,
  input,
  output,
} from '@angular/core';

import { Color } from '../../enums/color.enum';

@Component({
  selector: 'min-button',
  imports: [],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  public readonly Color = Color;

  public clicked: OutputEmitterRef<void> = output();
  public color: InputSignal<Color> = input<Color>(Color.White);
  public cssClass: Signal<string> = this.getCssClass();
  public disabled: InputSignal<boolean> = input(false);
  public type: InputSignal<string> = input('button');

  private getCssClass(): Signal<string> {
    return computed(() => {
      const baseClass: string =
        'w-full cursor-pointer rounded-lg border-4 border-black px-2 py-1 text-center font-bold uppercase shadow-2xl ' +
        'transform transition-all duration-100 ' +
        'active:translate-y-0.5 active:shadow-none ' +
        'disabled:cursor-not-allowed disabled:bg-gray-300 disabled:opacity-50 disabled:shadow-none disabled:hover:bg-gray-300 disabled:active:translate-0 ';
      switch (this.color()) {
        case Color.Blue:
          return baseClass + 'bg-blue-300 hover:bg-blue-500 focus:bg-blue-500';
        case Color.Red:
          return baseClass + 'bg-red-300 hover:bg-red-500  focus:bg-red-500';
        case Color.Green:
          return baseClass + 'bg-green-300 hover:bg-green-500  focus:bg-green-500';
        case Color.Yellow:
          return baseClass + 'bg-yellow-300 hover:bg-yellow-500focus:bg-yellow-500';
        case Color.Gray:
          return baseClass + 'bg-gray-300 hover:bg-gray-500  focus:bg-gray-500';
        default:
          return baseClass + 'bg-white hover:bg-gray-100  focus:bg-gray-100';
      }
    });
  }
}
