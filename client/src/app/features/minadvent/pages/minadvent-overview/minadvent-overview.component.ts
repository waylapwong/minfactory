import { Component, OnInit, Signal, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoutingService } from '../../../../core/routing/services/routing.service';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardButtonComponent } from '../../../../shared/components/card-button/card-button.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinAdventCalendarGroup } from '../../models/minadvent-calendar.model';
import { MinAdventCalendarService } from '../../services/minadvent-calendar.service';

@Component({
  selector: 'min-advent-overview',
  templateUrl: './minadvent-overview.component.html',
  host: { class: 'block min-h-full w-full' },
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardButtonComponent,
    DialogComponent,
    H1Component,
    H2Component,
    InputComponent,
    ReactiveFormsModule,
  ],
})
export class MinAdventOverviewComponent implements OnInit {
  public readonly Color: typeof Color = Color;
  public readonly createError = signal('');
  public readonly createForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    recipientName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    year: new FormControl(new Date().getFullYear(), {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(9999), Validators.pattern(/^\d+$/)],
    }),
  });
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
  public readonly isCreateDialogOpen = signal(false);
  public readonly isCreating = signal(false);
  public readonly isLoading = signal(true);

  constructor(
    public readonly routingService: RoutingService,
    private readonly calendarService: MinAdventCalendarService,
  ) {}

  public ngOnInit(): void {
    void this.loadCalendars();
  }

  public async createCalendar(): Promise<void> {
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid || this.isCreating()) {
      return;
    }

    this.isCreating.set(true);
    this.error.set('');
    try {
      const calendar = await this.calendarService.createCalendar(this.createForm.getRawValue());
      this.isCreateDialogOpen.set(false);
      this.routingService.navigateToMinAdventCalendar(calendar.id);
    } catch {
      this.createError.set('Der Kalender konnte nicht angelegt werden. Bitte prüfe deine Eingaben.');
    } finally {
      this.isCreating.set(false);
    }
  }

  public async loadCalendars(): Promise<void> {
    this.isLoading.set(true);
    this.error.set('');
    this.createError.set('');
    try {
      await this.calendarService.loadCalendars();
    } catch {
      this.error.set('Deine Kalender konnten nicht geladen werden. Bitte versuche es erneut.');
    } finally {
      this.isLoading.set(false);
    }
  }

  public openCreateDialog(): void {
    this.createError.set('');
    this.isCreateDialogOpen.set(true);
  }
}
