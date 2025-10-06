import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ContextService } from '../../core/services/context.service';
import { Application } from '../../shared/enums/application.enum';

@Component({
  selector: 'min-minrps',
  imports: [RouterOutlet],
  templateUrl: './minrps.component.html',
  styleUrls: ['./minrps.component.scss']
})
export class MinRPSComponent implements OnInit {
  constructor(private readonly contextService: ContextService) {}

  public ngOnInit(): void {
    this.contextService.app.set(Application.MinRPS);
  }
}
