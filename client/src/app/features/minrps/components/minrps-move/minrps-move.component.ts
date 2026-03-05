import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';

@Component({
  selector: 'minrps-move',
  templateUrl: './minrps-move.component.html',
  styleUrls: ['./minrps-move.component.scss'],
  imports: [],
})
export class MinRpsMoveComponent {
  public hasResult: InputSignal<boolean> = input(false);
  public isDraw: InputSignal<boolean> = input(false);
  public isDisabled: InputSignal<boolean> = input(false);
  public isPlayed: InputSignal<boolean> = input(false);
  public isSelected: InputSignal<boolean> = input(false);
  public isWinning: InputSignal<boolean> = input(false);
  public selected: OutputEmitterRef<void> = output();
}
