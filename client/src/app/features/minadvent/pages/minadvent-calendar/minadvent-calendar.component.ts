import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingService } from '../../../../core/routing/services/routing.service';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinAdventCalendarService } from '../../services/minadvent-calendar.service';

@Component({
  selector: 'min-advent-calendar',
  templateUrl: './minadvent-calendar.component.html',
  host: { class: 'block min-h-full w-full' },
  imports: [BadgeComponent, ButtonComponent, H1Component, H2Component, InputComponent, ReactiveFormsModule],
})
export class MinAdventCalendarComponent implements OnInit {
  public readonly Color: typeof Color = Color;
  public readonly calendar = signal<Awaited<ReturnType<MinAdventCalendarService['getCalendar']>> | null>(null);
  public readonly error = signal('');
  public readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    recipientName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    year: new FormControl(new Date().getFullYear(), {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(9999), Validators.pattern(/^\d+$/)],
    }),
  });
  public readonly isEditing = signal(false);
  public readonly isLoading = signal(false);
  public readonly isSavingRecipient = signal(false);
  public readonly isSavingTitle = signal(false);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly calendarService: MinAdventCalendarService,
    public readonly routingService: RoutingService,
  ) {}

  public async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    this.isEditing.set(true);
    this.isLoading.set(true);
    try {
      const calendar = await this.calendarService.getCalendar(id);
      this.calendar.set(calendar);
      this.form.controls.title.setValue(calendar.title);
      this.form.controls.recipientName.setValue(calendar.recipientName);
      this.form.controls.year.setValue(calendar.year);
    } catch {
      this.error.set('Der Kalender konnte nicht geladen werden.');
    } finally {
      this.isLoading.set(false);
    }
  }

  public async createCalendar(): Promise<void> {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    try {
      const calendar = await this.calendarService.createCalendar(this.form.getRawValue());
      await this.router.navigate(['/minadvent/calendars', calendar.id]);
    } catch {
      this.error.set('Der Kalender konnte nicht angelegt werden. Bitte prüfe deine Eingaben.');
    } finally {
      this.isLoading.set(false);
    }
  }

  public async saveRecipient(): Promise<void> {
    const calendar = this.calendar();
    const control = this.form.controls.recipientName;
    control.markAsTouched();
    if (!calendar || control.invalid) {
      return;
    }
    this.isSavingRecipient.set(true);
    this.error.set('');
    try {
      this.calendar.set(
        await this.calendarService.updateCalendar(calendar.id, {
          recipientName: control.value,
          expectedVersion: calendar.version,
        }),
      );
    } catch {
      this.error.set('Der Empfängername konnte nicht gespeichert werden. Bitte lade den Kalender neu.');
    } finally {
      this.isSavingRecipient.set(false);
    }
  }

  public async saveTitle(): Promise<void> {
    const calendar = this.calendar();
    const control = this.form.controls.title;
    control.markAsTouched();
    if (!calendar || control.invalid) {
      return;
    }
    this.isSavingTitle.set(true);
    this.error.set('');
    try {
      this.calendar.set(
        await this.calendarService.updateCalendar(calendar.id, {
          title: control.value,
          expectedVersion: calendar.version,
        }),
      );
    } catch {
      this.error.set('Der Titel konnte nicht gespeichert werden. Bitte lade den Kalender neu.');
    } finally {
      this.isSavingTitle.set(false);
    }
  }
}
