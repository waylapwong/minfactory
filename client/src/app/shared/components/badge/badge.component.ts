import { NgTemplateOutlet } from '@angular/common';
import { Component, InputSignal, input } from '@angular/core';

import { Color } from '../../enums/color.enum';

@Component({
  selector: 'min-badge',
  imports: [NgTemplateOutlet],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
})
export class BadgeComponent {
  public readonly Color = Color;

  public color: InputSignal<Color> = input<Color>(Color.Gray);
}
