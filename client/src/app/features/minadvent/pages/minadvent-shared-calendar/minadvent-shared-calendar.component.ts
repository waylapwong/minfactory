import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, Signal, computed, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MinAdventSharedCalendarDto } from '../../../../core/generated/model/min-advent-shared-calendar-dto';
import { MinAdventSharedDoorContentDto } from '../../../../core/generated/model/min-advent-shared-door-content-dto';
import { MinAdventSharedDoorOpenResponseDto } from '../../../../core/generated/model/min-advent-shared-door-open-response-dto';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinAdventCalendarService } from '../../services/minadvent-calendar.service';

@Component({
  selector: 'min-advent-shared-calendar',
  templateUrl: './minadvent-shared-calendar.component.html',
  styles: [
    `
      @keyframes minadvent-door-reveal {
        0% {
          opacity: 0;
          filter: blur(6px);
          transform: perspective(800px) rotateX(-35deg) scale(0.72);
        }
        60% {
          opacity: 1;
          filter: blur(0);
          transform: perspective(800px) rotateX(8deg) scale(1.03);
        }
        100% {
          opacity: 1;
          filter: blur(0);
          transform: perspective(800px) rotateX(0) scale(1);
        }
      }
      .minadvent-first-open {
        transform-origin: top center;
        backface-visibility: hidden;
        animation: minadvent-door-reveal 850ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
      }
      @media (prefers-reduced-motion: reduce) {
        .minadvent-first-open {
          animation-duration: 1ms;
        }
      }
    `,
  ],
  imports: [BadgeComponent, ButtonComponent, DialogComponent],
  host: { class: 'block min-h-full w-full' },
})
export class MinAdventSharedCalendarComponent implements OnInit, OnDestroy {
  public readonly Color: typeof Color = Color;
  public readonly animateDoor = signal(false);
  public readonly calendar = signal<MinAdventSharedCalendarDto | null>(null);
  public readonly now = signal(Date.now());
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
  public readonly doorError = signal('');
  public readonly error = signal('');
  public readonly isBeforeDecember: Signal<boolean> = computed(() => {
    const calendar = this.calendar();
    return calendar !== null && this.now() < this.getDecemberStart(calendar.year);
  });
  public readonly isDoorLoading = signal(false);
  public readonly isLoading = signal(true);
  public readonly reloadDialogOpen = signal(false);
  public readonly reloadRequired = signal(false);
  public readonly selectedDoor = signal<MinAdventSharedDoorContentDto | null>(null);

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

  public cancelReloadDialog(): void {
    this.reloadDialogOpen.set(false);
  }

  public closeDoor(): void {
    this.selectedDoor.set(null);
    this.animateDoor.set(false);
    this.doorError.set('');
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

  public isDoorAvailable(day: number): boolean {
    const parts = Object.fromEntries(
      BERLIN_DATE_FORMATTER.formatToParts(new Date(this.now())).map((part) => [part.type, Number(part.value)]),
    );
    const calendar = this.calendar();
    return (
      calendar !== null &&
      (parts['year'] > calendar.year ||
        (parts['year'] === calendar.year && parts['month'] === 12 && parts['day'] >= day))
    );
  }

  public openReloadDialog(): void {
    if (this.reloadRequired()) {
      this.reloadDialogOpen.set(true);
    }
  }

  public async reloadAfterConflict(): Promise<void> {
    await this.loadCalendar();
    const selectedDay = this.selectedDoor()?.day;
    const door = this.calendar()?.doors.find((item) => item.day === selectedDay);
    this.reloadRequired.set(false);
    this.reloadDialogOpen.set(false);
    this.doorError.set('');
    if (selectedDay && door?.status === 'OPENED') {
      try {
        this.showDoor(await this.calendarService.getSharedDoor(this.token, selectedDay), false);
      } catch {
        this.doorError.set('Der Inhalt konnte nach dem Neuladen nicht abgerufen werden.');
      }
    } else if (door?.status === 'FILLED') {
      this.doorError.set('Das Türchen ist noch nicht geöffnet. Klicke erneut darauf, um es zu öffnen.');
    }
  }

  public async retry(): Promise<void> {
    await this.loadCalendar();
  }

  public async selectDoor(day: number): Promise<void> {
    const calendar = this.calendar();
    const door = calendar?.doors.find((item) => item.day === day);
    if (!calendar || !door || !this.isDoorAvailable(day) || door.status === 'EMPTY' || this.isDoorLoading()) {
      return;
    }
    this.doorError.set('');
    this.reloadRequired.set(false);
    this.isDoorLoading.set(true);
    this.reloadDialogOpen.set(false);
    try {
      if (door.status === 'OPENED') {
        this.showDoor(await this.calendarService.getSharedDoor(this.token, day), false);
      } else {
        const response = await this.calendarService.openSharedDoor(this.token, day, calendar.version);
        this.applyOpenedDoor(response);
        this.showDoor(response, response.firstOpened);
      }
    } catch (error) {
      this.doorError.set(
        'Die Tür konnte nicht geöffnet werden. Lade zuerst die Übersicht neu, bevor du es erneut versuchst.',
      );
      this.reloadRequired.set(true);
      if (error instanceof HttpErrorResponse && error.status === 409) {
        this.doorError.set('Der Kalender wurde zwischenzeitlich geändert. Lade die Übersicht neu.');
        this.reloadDialogOpen.set(true);
      } else if (error instanceof HttpErrorResponse && error.status === 404) {
        this.doorError.set('Dieser Adventskalender ist nicht verfügbar.');
        this.reloadRequired.set(false);
        this.reloadDialogOpen.set(false);
      }
    } finally {
      this.isDoorLoading.set(false);
    }
  }

  private applyOpenedDoor(response: MinAdventSharedDoorOpenResponseDto): void {
    this.calendar.update((calendar) =>
      calendar === null
        ? null
        : {
            ...calendar,
            completed: response.completed,
            version: response.version,
            doors: calendar.doors.map((door) => (door.day === response.day ? { ...door, status: 'OPENED' } : door)),
          },
    );
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

  private showDoor(door: MinAdventSharedDoorContentDto, animate: boolean): void {
    this.selectedDoor.set(door);
    this.animateDoor.set(animate);
  }
}

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
