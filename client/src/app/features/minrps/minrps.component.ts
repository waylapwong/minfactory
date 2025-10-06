import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ContextService } from '../../core/services/context.service';
import { AppName } from '../../shared/enums/app-name.enum';

@Component({
  selector: 'min-minrps',
  templateUrl: './minrps.component.html',
  styleUrls: ['./minrps.component.scss'],
  host: { class: 'block h-full' },
  imports: [RouterOutlet],
})
export class MinRPSComponent implements OnInit {
  constructor(private readonly contextService: ContextService) {}

  public ngOnInit(): void {
    this.contextService.app.set(AppName.MinRPS);
  }
}
