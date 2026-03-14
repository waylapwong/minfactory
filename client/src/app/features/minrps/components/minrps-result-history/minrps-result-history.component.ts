import { Component, InputSignal, input } from '@angular/core';
import { MinRpsResult } from '../../../../core/generated';

@Component({
  selector: 'minrps-result-history',
  templateUrl: './minrps-result-history.component.html',
  imports: [],
})
export class MinRpsResultHistoryComponent {
  public resultHistory: InputSignal<MinRpsResult[]> = input<MinRpsResult[]>([]);

  public getAriaLabel(state: MinRpsResult, index: number): string {
    const resultNumber: number = index + 1;

    switch (state) {
      case MinRpsResult.Player1:
        return `Ergebnis ${resultNumber}: Sieg`;
      case MinRpsResult.Draw:
        return `Ergebnis ${resultNumber}: Unentschieden`;
      case MinRpsResult.Player2:
        return `Ergebnis ${resultNumber}: Niederlage`;
      default:
        return `Ergebnis ${resultNumber}: Unbekannt`;
    }
  }

  public getStateCssClass(state: MinRpsResult): string {
    switch (state) {
      case MinRpsResult.Player1:
        return 'bg-green-300';
      case MinRpsResult.Draw:
        return 'bg-yellow-300';
      case MinRpsResult.Player2:
        return 'bg-red-300';
      default:
        return 'bg-gray-300';
    }
  }
}
