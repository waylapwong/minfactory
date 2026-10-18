import { Component, OnInit, Signal, computed, signal } from '@angular/core';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardButtonComponent } from '../../../../shared/components/card-button/card-button.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { RoutingService } from '../../../../core/routing/services/routing.service';
import { Color } from '../../../../shared/enums/color.enum';
import { MinAdventCalendarGroup } from '../../models/minadvent-calendar.model';
import { MinAdventCalendarService } from '../../services/minadvent-calendar.service';

@Component({
  selector: 'min-advent-overview',
  templateUrl: './minadvent-overview.component.html',
  host: { class: 'block min-h-full w-full' },
  imports: [BadgeComponent, ButtonComponent, CardButtonComponent, H1Component, H2Component],
})
export class MinAdventOverviewComponent implements OnInit {
  public readonly Color: typeof Color = Color;
  public readonly isLoading = signal(true);
  public readonly error = signal('');
  public readonly groups: Signal<MinAdventCalendarGroup[]> = computed(() => {
    const calendars = this.calendarService.calendars();
    const years = [...new Set(calendars.map((calendar) => calendar.year))].sort((left, right) => {
      const currentYear = new Date().getFullYear();
      if (left === currentYear) {
        return -1;
      }
      if (right === currentYear) {
        return 1;
      }
      return right - left;
    });
    return years.map((year) => ({ year, calendars: calendars.filter((calendar) => calendar.year === year) }));
  });

  constructor(
    public readonly routingService: RoutingService,
    private readonly calendarService: MinAdventCalendarService,
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.loadCalendars();
  }

  public async loadCalendars(): Promise<void> {
    this.isLoading.set(true);
    this.error.set('');
    try {
      await this.calendarService.loadCalendars();
    } catch {
      this.error.set('Deine Kalender konnten nicht geladen werden. Bitte versuche es erneut.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
