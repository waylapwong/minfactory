import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';

@Component({
  selector: 'minrps-move',
  templateUrl: './minrps-move.component.html',
  styleUrls: ['./minrps-move.component.scss'],
  imports: [],
})
export class MinRPSMoveComponent {
  public disabled: InputSignal<boolean> = input(false);
  public isLocked: InputSignal<boolean> = input(false);
  public isSelected: InputSignal<boolean> = input(false);
  public selected: OutputEmitterRef<void> = output();
}
