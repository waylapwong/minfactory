import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContextService } from '../../core/context/context.service';
import { AppName } from '../../shared/enums/app-name.enum';

@Component({
  selector: 'min-poker',
  templateUrl: './minpoker.component.html',
  styles: [],
  host: { class: 'block h-full' },
  imports: [RouterOutlet],
})
export class MinPokerComponent implements OnInit {
  constructor(private readonly contextService: ContextService) {}

  public ngOnInit(): void {
    this.contextService.app.set(AppName.MinPoker);
  }
}