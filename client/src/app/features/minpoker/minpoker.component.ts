import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContextService } from '../../core/context/services/context.service';
import { LoggerService } from '../../core/logging/services/logger.service';
import { AppName } from '../../shared/enums/app-name.enum';

@Component({
  selector: 'min-poker',
  templateUrl: './minpoker.component.html',
  styleUrls: ['./minpoker.component.scss'],
  host: { class: 'block h-full' },
  imports: [RouterOutlet],
})
export class MinPokerComponent implements OnInit {
  private readonly logger: LoggerService = new LoggerService(MinPokerComponent.name);

  constructor(private readonly contextService: ContextService) {}

  public ngOnInit(): void {
    this.logger.debug(`START ngOnInit()`);
    this.contextService.app.set(AppName.MinPoker);
    this.logger.debug(`END ngOnInit(...)`);
  }
}
