import { Component } from '@angular/core';

import { ButtonComponent } from "../../../../shared/components/button/button.component";
import { CardComponent } from '../../../../shared/components/card/card.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { Color } from '../../../../shared/enums/color.enum';

@Component({
  selector: 'min-minrps-menu',
  templateUrl: './minrps-menu.component.html',
  styleUrls: ['./minrps-menu.component.scss'],
  host: { class: 'block h-full' },
  imports: [CardComponent, H2Component, ButtonComponent]
})
export class MinRPSMenuComponent {
  readonly Color = Color;
}
