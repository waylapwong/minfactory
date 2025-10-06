import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ContextService } from '../../core/services/context.service';
import { AppName } from '../../shared/enums/app-name.enum';

@Component({
  selector: 'app-minfactory',
  templateUrl: './minfactory.component.html',
  styleUrls: ['./minfactory.component.scss'],
  imports: [RouterOutlet],
})
export class MinFactoryComponent implements OnInit {
  constructor(private readonly contextService: ContextService) {}

  public ngOnInit(): void {
    this.contextService.app.set(AppName.MinFactory);
  }
}
