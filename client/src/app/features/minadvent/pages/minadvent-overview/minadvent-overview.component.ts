import { Component, OnInit, Signal, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MinAdventCalendarGroup } from '../../models/minadvent-calendar.model';
import { MinAdventCalendarService } from '../../services/minadvent-calendar.service';

@Component({
  selector: 'min-advent-overview',
  templateUrl: './minadvent-overview.component.html',
  host: { class: 'block min-h-full w-full' },
  imports: [RouterLink],
})
export class MinAdventOverviewComponent implements OnInit {
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

  constructor(private readonly calendarService: MinAdventCalendarService) {}

  public async ngOnInit(): Promise<void> {
    try {
      await this.calendarService.loadCalendars();
    } catch {
      this.error.set('Deine Kalender konnten nicht geladen werden. Bitte versuche es erneut.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
