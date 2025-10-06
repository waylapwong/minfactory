import { Component, InputSignal, OutputEmitterRef, Signal, computed, input, output } from "@angular/core";

import { Color } from "../../enums/color.enum";

@Component({
  selector: 'min-button',
  imports: [],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  public readonly Color = Color;

  public clicked: OutputEmitterRef<void> = output();
  public color: InputSignal<Color> = input<Color>(Color.Gray);
  public cssClass: Signal<string> = this.getCssClass();
  public disabled: InputSignal<boolean> = input(false);
  public type: InputSignal<string> = input('button');

  private getCssClass(): Signal<string> {
    return computed(() => {
      const baseClass: string =
        'w-full cursor-pointer rounded-lg border-4 border-black px-2 py-1 text-center font-bold uppercase shadow-2xl ' +
        'transform transition-all ' +
        'active:translate-y-0.5 active:shadow-none ' +
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:translate-0 ';
      switch (this.color()) {
        case Color.Blue:
          return (
            baseClass + 'bg-blue-200 hover:bg-blue-400 hover:disabled:bg-blue-200 focus:bg-blue-400'
          );
        case Color.Red:
          return (
            baseClass + 'bg-red-200 hover:bg-red-400 hover:disabled:bg-red-200 focus:bg-red-400'
          );
        case Color.Green:
          return (
            baseClass +
            'bg-green-200 hover:bg-green-400 hover:disabled:bg-green-200 focus:bg-green-400'
          );
        case Color.Yellow:
          return (
            baseClass +
            'bg-yellow-200 hover:bg-yellow-400 hover:disabled:bg-yellow-200 focus:bg-yellow-400'
          );
        default:
          return baseClass + 'bg-gray-200 hover:bg-gray-400 hover:disabled:bg-white focus:bg-gray-400';
      }
    });
  }
}
