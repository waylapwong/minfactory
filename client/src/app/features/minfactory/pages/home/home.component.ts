import { Component } from "@angular/core";

import { LogoComponent } from "../../../../shared/components/logo/logo.component";

@Component({
  selector: 'min-home',
  imports: [LogoComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {}
