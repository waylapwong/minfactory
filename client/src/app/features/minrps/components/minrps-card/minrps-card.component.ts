import { Component, InputSignal, input } from '@angular/core';

@Component({
  selector: 'minrps-card',
  templateUrl: './minrps-card.component.html',
  styleUrls: ['./minrps-card.component.scss'],
  imports: [],
})
export class MinRpsCardComponent {
  public hasResult: InputSignal<boolean> = input(false);
  public isDraw: InputSignal<boolean> = input(false);
  public isWinning: InputSignal<boolean> = input(false);
}
