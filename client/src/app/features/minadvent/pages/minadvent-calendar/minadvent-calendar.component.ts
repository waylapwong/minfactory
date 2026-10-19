import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, ElementRef, HostListener, OnInit, signal, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MinAdventBlockDto } from '../../../../core/generated/model/min-advent-block-dto';
import { MinAdventBlockType } from '../../../../core/generated/model/min-advent-block-type';
import { RoutingService } from '../../../../core/routing/services/routing.service';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinAdventDoor } from '../../models/minadvent-calendar.model';
import { MinAdventCalendarService } from '../../services/minadvent-calendar.service';

type DoorBlockForm = FormGroup<{
  description: FormControl<string>;
  text: FormControl<string>;
  title: FormControl<string>;
  type: FormControl<MinAdventBlockType>;
  url: FormControl<string>;
}>;

@Component({
  selector: 'min-advent-calendar',
  templateUrl: './minadvent-calendar.component.html',
  host: { class: 'block min-h-full w-full' },
  imports: [BadgeComponent, ButtonComponent, H1Component, H2Component, InputComponent, ReactiveFormsModule],
})
export class MinAdventCalendarComponent implements OnInit {
  public readonly Color: typeof Color = Color;
  public readonly calendar = signal<Awaited<ReturnType<MinAdventCalendarService['getCalendar']>> | null>(null);
  public readonly doorForm = new FormArray<DoorBlockForm>([]);
  public readonly doorDraftRevision = signal(0);
  public readonly doorError = signal('');
  public readonly doorSuccess = signal('');
  public readonly isSavingDoor = signal(false);
  public readonly selectedDoorDay = signal<number | null>(null);
  public readonly selectedDoor = computed(() => {
    const day = this.selectedDoorDay();
    return this.calendar()?.doors.find((door) => door.day === day) ?? null;
  });
  public readonly filledDoorCount = computed(
    () => this.calendar()?.doors.filter((door) => door.status === 'FILLED' || door.status === 'OPENED').length ?? 0,
  );
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
  public readonly MinAdventBlockType = MinAdventBlockType;

  @ViewChild('doorDialog') private readonly doorDialog?: ElementRef<HTMLDialogElement>;

  private originalDoorBlocks: MinAdventBlockDto[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly calendarService: MinAdventCalendarService,
    public readonly routingService: RoutingService,
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      void this.loadCalendar(id);
    }
  }

  public getDoorStatusLabel(status: MinAdventDoor['status']): string {
    switch (status) {
      case 'EMPTY':
        return 'Leer';
      case 'FILLED':
        return 'Befüllt';
      case 'OPENED':
        return 'Geöffnet';
    }
  }

  private async loadCalendar(id: string): Promise<void> {
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

  public navigateBack(): void {
    if (this.confirmDiscardDoorDraft()) {
      this.routingService.navigateToMinAdvent();
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

  public selectDoor(door: MinAdventDoor): void {
    if (this.hasUnsavedDoorChanges() && !this.confirmDiscardDoorDraft()) {
      return;
    }
    this.loadDoorDraft(door);
    const dialog = this.doorDialog?.nativeElement;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }

  public closeDoorDialog(): void {
    if (!this.confirmDiscardDoorDraft()) {
      return;
    }
    this.doorDialog?.nativeElement.close();
    this.selectedDoorDay.set(null);
    this.doorForm.clear();
    this.originalDoorBlocks = [];
    this.doorDraftRevision.update((revision) => revision + 1);
  }

  public onDoorDialogCancel(event: Event): void {
    event.preventDefault();
    this.closeDoorDialog();
  }

  private loadDoorDraft(door: MinAdventDoor): void {
    this.selectedDoorDay.set(door.day);
    this.originalDoorBlocks = this.normalizeBlocks(door.blocks);
    this.doorForm.clear({ emitEvent: false });
    for (const block of this.originalDoorBlocks) {
      this.doorForm.push(this.createBlockForm(block), { emitEvent: false });
    }
    this.doorForm.markAsPristine();
    this.doorDraftRevision.update((revision) => revision + 1);
    this.doorError.set('');
    this.doorSuccess.set('');
  }

  public addBlock(type: MinAdventBlockType): void {
    if (this.doorForm.length >= 10 || this.isSelectedDoorReadOnly()) {
      return;
    }
    this.doorForm.push(this.createBlockForm({ position: this.doorForm.length + 1, type }));
    this.onDoorDraftChanged();
  }

  public removeBlock(index: number): void {
    this.doorForm.removeAt(index);
    this.onDoorDraftChanged();
  }

  public moveBlock(index: number, offset: number): void {
    const target = index + offset;
    if (target < 0 || target >= this.doorForm.length) {
      return;
    }
    const block = this.doorForm.at(index);
    this.doorForm.removeAt(index, { emitEvent: false });
    this.doorForm.insert(target, block, { emitEvent: false });
    this.onDoorDraftChanged();
  }

  public formatText(
    index: number,
    command: 'bold' | 'italic' | 'insertUnorderedList' | 'insertOrderedList' | 'formatBlock',
  ): void {
    const editor = document.getElementById(`door-text-${index}`);
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) {
      return;
    }
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }
    editor.focus();
    let wrapperTag: string;
    switch (command) {
      case 'bold':
        wrapperTag = 'strong';
        break;
      case 'italic':
        wrapperTag = 'em';
        break;
      case 'insertUnorderedList':
        wrapperTag = 'ul';
        break;
      case 'insertOrderedList':
        wrapperTag = 'ol';
        break;
      default:
        wrapperTag = 'p';
    }
    const wrapper = document.createElement(wrapperTag);
    const contents = range.extractContents();
    if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      const item = document.createElement('li');
      item.append(contents);
      wrapper.append(item);
    } else {
      wrapper.append(contents);
    }
    range.insertNode(wrapper);
    const formattedRange = document.createRange();
    formattedRange.selectNodeContents(wrapper);
    selection.removeAllRanges();
    selection.addRange(formattedRange);
    this.updateTextBlock(index, editor.innerHTML);
  }

  public updateTextBlock(index: number, text: string): void {
    this.doorForm.at(index).controls.text.setValue(text);
    this.onDoorDraftChanged();
  }

  public updateDoorField(): void {
    this.onDoorDraftChanged();
  }

  public hasUnsavedDoorChanges(): boolean {
    this.doorDraftRevision();
    return JSON.stringify(this.toBlocks()) !== JSON.stringify(this.originalDoorBlocks);
  }

  public confirmDiscardDoorDraft(): boolean {
    return !this.hasUnsavedDoorChanges() || window.confirm('Ungespeicherte Türchenänderungen verwerfen?');
  }

  public canDeactivate(): boolean {
    return this.confirmDiscardDoorDraft();
  }

  @HostListener('window:beforeunload', ['$event'])
  public warnBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedDoorChanges()) {
      event.preventDefault();
    }
  }

  public isSelectedDoorReadOnly(): boolean {
    const door = this.selectedDoor();
    return !door || door.status === 'OPENED' || Boolean(this.calendar()?.completed);
  }

  public isDoorFormValid(): boolean {
    if (this.doorForm.length > 10) {
      return false;
    }
    return this.doorForm.controls.every((block) => {
      const value = block.getRawValue();
      if (value.type === MinAdventBlockType.Text) {
        const visibleText = this.visibleText(value.text);
        return visibleText.length > 0 && [...visibleText].length <= 10000;
      }
      if (!value.title.trim() || value.title.trim().length > 100) {
        return false;
      }
      if (value.type === MinAdventBlockType.Link) {
        try {
          const url = new URL(value.url.trim());
          return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname) && value.url.length <= 2048;
        } catch {
          return false;
        }
      }
      return value.description.trim().length > 0 && value.description.trim().length <= 2000;
    });
  }

  public countVisibleCharacters(text: string): number {
    return [...this.visibleText(text)].length;
  }

  public async saveDoor(): Promise<void> {
    const calendar = this.calendar();
    const door = this.selectedDoor();
    if (!calendar || !door || this.isSelectedDoorReadOnly() || !this.isDoorFormValid()) {
      this.doorError.set('Bitte prüfe die Pflichtfelder und Zeichenbegrenzungen.');
      return;
    }
    const blocks = this.toBlocks();
    if (
      this.willCompleteCalendar(door, blocks) &&
      !window.confirm('Dieses Türchen leeren und den Kalender abschließen?')
    ) {
      return;
    }
    this.isSavingDoor.set(true);
    this.doorError.set('');
    this.doorSuccess.set('');
    try {
      const result = await this.calendarService.updateDoor(calendar.id, door.day, {
        expectedVersion: calendar.version,
        blocks,
      });
      const updatedDoor: MinAdventDoor = { ...door, blocks, status: result.status };
      this.calendar.set({
        ...calendar,
        completed: result.completed,
        doors: calendar.doors.map((item) => (item.day === result.day ? updatedDoor : item)),
        version: result.version,
      });
      this.originalDoorBlocks = blocks.map((block) => ({ ...block }));
      this.doorForm.markAsPristine();
      this.doorDraftRevision.update((revision) => revision + 1);
      this.doorSuccess.set('Türchen gespeichert.');
    } catch (reason) {
      const error = reason as HttpErrorResponse;
      const code = error.error?.code;
      if (error.status === 409 && ['VERSION_CONFLICT', 'CALENDAR_COMPLETED', 'DOOR_OPENED'].includes(code)) {
        this.doorError.set(
          code === 'VERSION_CONFLICT'
            ? 'Der Kalender wurde zwischenzeitlich geändert. Dein Entwurf bleibt erhalten.'
            : 'Der Kalenderzustand hat sich geändert. Dein Entwurf bleibt erhalten.',
        );
        if (window.confirm('Kalender jetzt aktualisieren und den lokalen Entwurf verwerfen?')) {
          await this.reloadCalendarAndDoor(calendar.id, door.day);
        }
      } else {
        this.doorError.set('Das Türchen konnte nicht gespeichert werden. Bitte prüfe deine Eingaben.');
      }
    } finally {
      this.isSavingDoor.set(false);
    }
  }

  private createBlockForm(block?: Partial<MinAdventBlockDto>): DoorBlockForm {
    return new FormGroup({
      description: new FormControl(block?.description ?? '', { nonNullable: true }),
      text: new FormControl(block?.text ?? '', { nonNullable: true }),
      title: new FormControl(block?.title ?? '', { nonNullable: true }),
      type: new FormControl(block?.type ?? MinAdventBlockType.Text, { nonNullable: true }),
      url: new FormControl(block?.url ?? '', { nonNullable: true }),
    });
  }

  private toBlocks(): MinAdventBlockDto[] {
    return this.normalizeBlocks(
      this.doorForm.controls.map((block, index) => ({
        ...block.getRawValue(),
        position: index + 1,
      })),
    );
  }

  private normalizeBlocks(blocks: MinAdventBlockDto[]): MinAdventBlockDto[] {
    return blocks.map((block, index) => {
      if (block.type === MinAdventBlockType.Text) {
        return { position: index + 1, text: block.text ?? '', type: block.type };
      }
      if (block.type === MinAdventBlockType.Link) {
        return {
          position: index + 1,
          title: block.title ?? '',
          type: block.type,
          url: block.url ?? '',
        };
      }
      return {
        description: block.description ?? '',
        position: index + 1,
        title: block.title ?? '',
        type: block.type,
      };
    });
  }

  private onDoorDraftChanged(): void {
    this.doorDraftRevision.update((revision) => revision + 1);
    this.doorError.set('');
    this.doorSuccess.set('');
  }

  private async reloadCalendarAndDoor(calendarId: string, day: number): Promise<void> {
    try {
      const refreshed = await this.calendarService.getCalendar(calendarId);
      this.calendar.set(refreshed);
      const refreshedDoor = refreshed.doors.find((item) => item.day === day);
      if (refreshedDoor) {
        this.loadDoorDraft(refreshedDoor);
      } else {
        this.selectedDoorDay.set(null);
        this.doorForm.clear();
      }
    } catch {
      this.doorError.set('Aktualisieren fehlgeschlagen. Dein Entwurf bleibt erhalten.');
    }
  }

  private visibleText(html: string): string {
    const container = document.createElement('div');
    container.innerHTML = html;
    return container.textContent?.replaceAll('\u00a0', ' ').trim() ?? '';
  }

  private willCompleteCalendar(door: MinAdventDoor, blocks: MinAdventBlockDto[]): boolean {
    if (
      blocks.length > 0 ||
      door.status !== 'FILLED' ||
      !this.calendar()?.doors.some((item) => item.status === 'OPENED')
    ) {
      return false;
    }
    const calendar = this.calendar();
    if (!calendar || calendar.doors.some((item) => item.day !== door.day && item.status === 'FILLED')) {
      return false;
    }
    const berlinDate = new Intl.DateTimeFormat('en', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(new Date());
    const parts = Object.fromEntries(berlinDate.map((part) => [part.type, Number(part.value)]));
    return (
      parts['year'] > calendar.year || (parts['year'] === calendar.year && parts['month'] === 12 && parts['day'] >= 25)
    );
  }
}
