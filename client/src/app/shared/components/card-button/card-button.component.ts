import { Component, OutputEmitterRef, output } from '@angular/core';

@Component({
  selector: 'min-card-button',
  templateUrl: './card-button.component.html',
  styleUrls: ['./card-button.component.scss'],
  imports: [],
})
export class CardButtonComponent {
  public clicked: OutputEmitterRef<void> = output();
}
