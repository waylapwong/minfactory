import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContextService } from '../../core/context/services/context.service';
import { AppName } from '../../shared/enums/app-name.enum';

@Component({
  selector: 'min-advent',
  templateUrl: './minadvent.component.html',
  imports: [RouterOutlet],
  host: { class: 'block h-full' },
})
export class MinAdventComponent implements OnInit {
  constructor(private readonly contextService: ContextService) {}

  public ngOnInit(): void {
    this.contextService.app.set(AppName.MinAdvent);
  }
}
