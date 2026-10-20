import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, Signal, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MinAdventSharedCalendarDto } from '../../../../core/generated/model/min-advent-shared-calendar-dto';
import { MinAdventCalendarService } from '../../services/minadvent-calendar.service';

const BERLIN_DATE_FORMATTER = new Intl.DateTimeFormat('en', {
  timeZone: 'Europe/Berlin',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hourCycle: 'h23',
});

@Component({
  selector: 'min-advent-shared-calendar',
  templateUrl: './minadvent-shared-calendar.component.html',
  host: { class: 'block min-h-full w-full' },
})
export class MinAdventSharedCalendarComponent implements OnInit, OnDestroy {
  public readonly calendar = signal<MinAdventSharedCalendarDto | null>(null);
  public readonly error = signal('');
  public readonly isLoading = signal(true);
  public readonly now = signal(Date.now());
  public readonly isBeforeDecember: Signal<boolean> = computed(() => {
    const calendar = this.calendar();
    return calendar !== null && this.now() < this.getDecemberStart(calendar.year);
  });
  public readonly countdown = computed(() => {
    const calendar = this.calendar();
    if (!calendar) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const remainingSeconds = Math.max(0, Math.floor((this.getDecemberStart(calendar.year) - this.now()) / 1000));
    return {
      days: Math.floor(remainingSeconds / 86400),
      hours: Math.floor((remainingSeconds % 86400) / 3600),
      minutes: Math.floor((remainingSeconds % 3600) / 60),
      seconds: remainingSeconds % 60,
    };
  });

  private readonly token: string;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly calendarService: MinAdventCalendarService,
  ) {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
  }

  public ngOnInit(): void {
    void this.loadCalendar();
    this.countdownInterval = setInterval(() => this.now.set(Date.now()), 1000);
  }

  public ngOnDestroy(): void {
    if (this.countdownInterval !== null) {
      clearInterval(this.countdownInterval);
    }
  }

  public async retry(): Promise<void> {
    await this.loadCalendar();
  }

  public getDoorStatusLabel(status: string): string {
    switch (status) {
      case 'FILLED':
        return 'Befüllt';
      case 'OPENED':
        return 'Geöffnet';
      default:
        return 'Leer';
    }
  }

  private async loadCalendar(): Promise<void> {
    if (!this.token) {
      this.error.set('Dieser Adventskalender ist nicht verfügbar.');
      this.isLoading.set(false);
      return;
    }
    this.isLoading.set(true);
    this.error.set('');
    try {
      this.calendar.set(await this.calendarService.getSharedCalendar(this.token));
    } catch (error) {
      this.error.set(
        error instanceof HttpErrorResponse && error.status === 404
          ? 'Dieser Adventskalender ist nicht verfügbar.'
          : 'Der Adventskalender konnte nicht geladen werden. Bitte versuche es erneut.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  private getDecemberStart(year: number): number {
    const localMidnight = new Date(0);
    localMidnight.setUTCFullYear(year, 11, 1);
    localMidnight.setUTCHours(0, 0, 0, 0);
    const localMidnightTimestamp = localMidnight.getTime();
    let timestamp = localMidnightTimestamp;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const dateParts = Object.fromEntries(
        BERLIN_DATE_FORMATTER.formatToParts(new Date(timestamp)).map((part) => [part.type, Number(part.value)]),
      );
      const berlinAsUtc = new Date(0);
      berlinAsUtc.setUTCFullYear(dateParts['year'], dateParts['month'] - 1, dateParts['day']);
      berlinAsUtc.setUTCHours(dateParts['hour'], dateParts['minute'], dateParts['second'], 0);
      timestamp = localMidnightTimestamp - (berlinAsUtc.getTime() - timestamp);
    }

    return timestamp;
  }
}