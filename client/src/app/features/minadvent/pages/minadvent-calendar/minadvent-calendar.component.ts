import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnInit, computed, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MinAdventBlockDto } from '../../../../core/generated/model/min-advent-block-dto';
import { MinAdventBlockType } from '../../../../core/generated/model/min-advent-block-type';
import { RoutingService } from '../../../../core/routing/services/routing.service';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { H1Component } from '../../../../shared/components/h1/h1.component';
import { H2Component } from '../../../../shared/components/h2/h2.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { MinAdventSelectComponent } from '../../../../shared/components/select/min-advent-select.component';
import { SelectOption } from '../../../../shared/components/select/select.component';
import { SnackbarComponent } from '../../../../shared/components/snackbar/snackbar.component';
import { TextareaComponent } from '../../../../shared/components/textarea/textarea.component';
import { Color } from '../../../../shared/enums/color.enum';
import { MinAdventDoor } from '../../models/minadvent-calendar.model';
import { MinAdventCalendarService } from '../../services/minadvent-calendar.service';

@Component({
  selector: 'min-advent-calendar',
  templateUrl: './minadvent-calendar.component.html',
  host: { class: 'block min-h-full w-full' },
  imports: [
    BadgeComponent,
    ButtonComponent,
    DialogComponent,
    H1Component,
    H2Component,
    InputComponent,
    MinAdventSelectComponent,
    SnackbarComponent,
    TextareaComponent,
    ReactiveFormsModule,
  ],
})
export class MinAdventCalendarComponent implements OnInit {
  public readonly Color: typeof Color = Color;
  public readonly MinAdventBlockType = MinAdventBlockType;
  public readonly calendar = signal<Awaited<ReturnType<MinAdventCalendarService['getCalendar']>> | null>(null);
  public readonly closeDoorError = signal('');
  public readonly doorBlockTypeOptions: readonly SelectOption[] = [
    { label: 'Text', value: MinAdventBlockType.Text },
    { label: 'Link', value: MinAdventBlockType.Link },
    { label: 'Gutschein', value: MinAdventBlockType.Voucher },
  ];
  public readonly doorDraftRevision = signal(0);
  public readonly doorForm = new FormArray<DoorBlockForm>([]);
  public readonly emptyDoorCount = computed(
    () => this.calendar()?.doors.filter((door) => door.status === 'EMPTY').length ?? 0,
  );
  public readonly error = signal('');
  public readonly filledDoorCount = computed(
    () => this.calendar()?.doors.filter((door) => door.status === 'FILLED').length ?? 0,
  );
  public readonly form = new FormGroup({
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
  public readonly isClosingDoor = signal(false);
  public readonly isLoading = signal(false);
  public readonly isRefreshingDoor = signal(false);
  public readonly isSavingDoor = signal(false);
  public readonly isSavingRecipient = signal(false);
  public readonly isSavingTitle = signal(false);
  public readonly isSharing = signal(false);
  public readonly isSnackbarOpen = signal(false);
  public readonly openedDoorCount = computed(
    () => this.calendar()?.doors.filter((door) => door.status === 'OPENED').length ?? 0,
  );
  public readonly selectedDoorDay = signal<number | null>(null);
  public readonly doorConflictError = signal('');
  public readonly selectedDoor = computed(() => {
    const day = this.selectedDoorDay();
    return this.calendar()?.doors.find((door) => door.day === day) ?? null;
  });
  public readonly sharedUrl = signal('');
  public readonly sharingDialogAction = signal<'publish' | 'revoke' | 'rotate' | null>(null);
  public readonly sharingError = signal('');
  public readonly snackbarMessage = signal('');

  private readonly originalTextByForm = new WeakMap<DoorBlockForm, string>();

  private originalDoorBlocks: MinAdventBlockDto[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly calendarService: MinAdventCalendarService,
    public readonly routingService: RoutingService,
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      void this.loadCalendar(id);
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  public warnBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedDoorChanges()) {
      event.preventDefault();
    }
  }

  public addBlock(type: MinAdventBlockType): void {
    if (this.doorForm.length >= 10 || this.isSelectedDoorReadOnly()) {
      return;
    }
    this.doorForm.push(this.createBlockForm({ position: this.doorForm.length + 1, type }));
    this.onDoorDraftChanged();
  }

  public canCloseDoor(door: MinAdventDoor): boolean {
    return Boolean(this.calendar()) && door.status === 'OPENED';
  }

  public canDeactivate(): boolean {
    return this.confirmDiscardDoorDraft();
  }

  public async closeDoor(): Promise<void> {
    const calendar = this.calendar();
    const door = this.selectedDoor();
    if (!calendar || !door || !this.canCloseDoor(door) || this.isClosingDoor()) {
      return;
    }
    this.isClosingDoor.set(true);
    this.closeDoorError.set('');
    try {
      const result = await this.calendarService.closeDoor(calendar.id, door.day, calendar.version);
      this.calendar.set({
        ...calendar,
        completed: result.completed,
        doors: calendar.doors.map((item) => (item.day === door.day ? { ...item, status: 'FILLED' } : item)),
        version: result.version,
      });
      this.syncDoorFormReadOnlyState();
      this.originalDoorBlocks = this.normalizeBlocks(door.blocks);
      this.showSnackbar('Türchen geschlossen. Du kannst den Inhalt jetzt bearbeiten.');
    } catch (error) {
      const code = (error as HttpErrorResponse).error?.code;
      if (code === 'VERSION_CONFLICT') {
        this.closeDoorError.set('Der Kalender wurde zwischenzeitlich geändert. Lade ihn neu und versuche es erneut.');
      } else {
        this.closeDoorError.set('Das Türchen konnte nicht geschlossen werden. Bitte versuche es erneut.');
      }
    } finally {
      this.isClosingDoor.set(false);
    }
  }

  public closeDoorDialog(): void {
    if (!this.confirmDiscardDoorDraft()) {
      return;
    }
    this.selectedDoorDay.set(null);
    this.doorConflictError.set('');
    this.closeDoorError.set('');
    this.doorForm.clear();
    this.originalDoorBlocks = [];
    this.doorDraftRevision.update((revision) => revision + 1);
  }

  public closeSharingDialog(): void {
    if (!this.isSharing()) {
      this.sharingDialogAction.set(null);
      this.sharingError.set('');
    }
  }

  public closeSnackbar(): void {
    this.isSnackbarOpen.set(false);
    this.snackbarMessage.set('');
  }

  public confirmDiscardDoorDraft(): boolean {
    return !this.hasUnsavedDoorChanges() || window.confirm('Ungespeicherte Türchenänderungen verwerfen?');
  }

  public async confirmSharingAction(): Promise<void> {
    const calendar = this.calendar();
    const action = this.sharingDialogAction();
    if (!calendar || !action || this.isSharing()) {
      return;
    }
    this.isSharing.set(true);
    this.sharingError.set('');
    try {
      const response =
        action === 'rotate'
          ? await this.calendarService.rotateSharingToken(calendar.id, calendar.version)
          : await this.calendarService.updateSharing(calendar.id, action === 'publish', calendar.version);
      this.calendar.update((current) =>
        current
          ? { ...current, completed: response.completed, published: response.published, version: response.version }
          : current,
      );
      this.sharedUrl.set(response.sharedUrl ? new URL(response.sharedUrl, window.location.origin).toString() : '');
      this.sharingDialogAction.set(null);
    } catch (error) {
      this.sharingError.set(
        error instanceof HttpErrorResponse && error.status === 409
          ? 'Der Kalender wurde zwischenzeitlich geändert. Lade ihn neu und versuche es erneut.'
          : 'Die Freigabe konnte nicht geändert werden. Bitte versuche es erneut.',
      );
    } finally {
      this.isSharing.set(false);
    }
  }

  public async copySharedUrl(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.sharedUrl());
      this.showSnackbar('Freigabelink kopiert.');
    } catch {
      this.sharingError.set('Der Link konnte nicht kopiert werden. Markiere ihn und kopiere ihn manuell.');
    }
  }

  public countVisibleCharacters(text: string): number {
    return [...this.normalizeText(text).trim()].length;
  }

  public getDoorFieldError(index: number, field: 'text' | 'title' | 'url' | 'description'): string | null {
    const block = this.doorForm.at(index);
    if (!block) {
      return null;
    }
    switch (field) {
      case 'text':
        return this.getTextFieldError(block.controls.text.value);
      case 'title':
        return this.getTitleFieldError(block.controls.title.value);
      case 'url':
        return this.getUrlFieldError(block.controls.url.value);
      case 'description':
        return this.getDescriptionFieldError(block.controls.description.value);
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

  public getSharingDialogMessage(): string {
    switch (this.sharingDialogAction()) {
      case 'publish':
        return 'Jede Person mit dem geheimen Link kann den Kalender ansehen und verfügbare Türchen öffnen.';
      case 'revoke':
        return 'Der aktuelle Link wird sofort ungültig. Inhalte und Türchenstatus bleiben erhalten.';
      case 'rotate':
        return 'Der bisherige Link wird sofort ungültig und durch einen neuen Link ersetzt.';
      default:
        return '';
    }
  }

  public getSharingDialogTitle(): string {
    switch (this.sharingDialogAction()) {
      case 'publish':
        return 'Kalender veröffentlichen?';
      case 'revoke':
        return 'Freigabe widerrufen?';
      case 'rotate':
        return 'Freigabelink erneuern?';
      default:
        return '';
    }
  }

  public hasUnsavedDoorChanges(): boolean {
    this.doorDraftRevision();
    return JSON.stringify(this.toBlocks()) !== JSON.stringify(this.originalDoorBlocks);
  }

  public isDoorFieldInvalid(index: number, field: 'text' | 'title' | 'url' | 'description'): boolean {
    return this.doorForm.at(index).controls[field].touched && Boolean(this.getDoorFieldError(index, field));
  }

  public isDoorFormValid(): boolean {
    if (this.doorForm.length > 10) {
      return false;
    }
    return this.doorForm.controls.every((block) => {
      const value = block.getRawValue();
      if (value.type === MinAdventBlockType.Text) {
        const visibleText = this.visibleText(value.text);
        return visibleText.length > 0 && [...visibleText].length <= 500;
      }
      if (!value.title.trim() || value.title.trim().length > 50) {
        return false;
      }
      if (value.type === MinAdventBlockType.Link) {
        try {
          const url = new URL(value.url.trim());
          return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname) && value.url.length <= 50;
        } catch {
          return false;
        }
      }
      return value.description.trim().length > 0 && value.description.trim().length <= 200;
    });
  }

  public isDoorSaveDisabled(): boolean {
    return !this.hasUnsavedDoorChanges() || !this.isDoorFormValid() || this.isSavingDoor();
  }

  public isRecipientSaveDisabled(): boolean {
    const calendar = this.calendar();
    return (
      !calendar ||
      this.form.controls.recipientName.invalid ||
      this.isSavingRecipient() ||
      this.form.controls.recipientName.value === calendar.recipientName
    );
  }

  public isSelectedDoorReadOnly(): boolean {
    const door = this.selectedDoor();
    return !door || door.status === 'OPENED' || Boolean(this.calendar()?.completed);
  }

  public isTitleSaveDisabled(): boolean {
    const calendar = this.calendar();
    return (
      !calendar ||
      this.form.controls.title.invalid ||
      this.isSavingTitle() ||
      this.form.controls.title.value === calendar.title
    );
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

  public navigateBack(): void {
    this.routingService.navigateToMinAdvent();
  }

  public openSharingDialog(action: 'publish' | 'revoke' | 'rotate'): void {
    this.sharingError.set('');
    this.sharingDialogAction.set(action);
  }

  public removeBlock(index: number): void {
    this.doorForm.removeAt(index);
    this.onDoorDraftChanged();
  }

  public async saveDoor(): Promise<void> {
    const calendar = this.calendar();
    const door = this.selectedDoor();
    if (!calendar || !door || this.isSelectedDoorReadOnly()) {
      return;
    }
    if (!this.hasUnsavedDoorChanges()) {
      return;
    }
    if (!this.isDoorFormValid()) {
      this.doorForm.markAllAsTouched();
      return;
    }
    const blocks = this.toBlocks();
    if (this.shouldCancelDoorSave(door, blocks)) {
      return;
    }
    this.isSavingDoor.set(true);
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
      this.doorConflictError.set('');
      this.originalDoorBlocks = blocks.map((block) => ({ ...block }));
      this.doorForm.markAsPristine();
      this.doorDraftRevision.update((revision) => revision + 1);
      this.closeDoorDialog();
      this.showSnackbar('Türchen gespeichert.');
    } catch (reason) {
      this.handleDoorSaveError(reason);
    } finally {
      this.isSavingDoor.set(false);
    }
  }

  public async saveRecipient(): Promise<void> {
    const calendar = this.calendar();
    const control = this.form.controls.recipientName;
    control.markAsTouched();
    if (!calendar || control.invalid || control.value === calendar.recipientName) {
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
    if (!calendar || control.invalid || control.value === calendar.title) {
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
    this.doorConflictError.set('');
    this.closeDoorError.set('');
    this.loadDoorDraft(door);
  }

  public async reloadDoorAfterConflict(): Promise<void> {
    const calendar = this.calendar();
    const door = this.selectedDoor();
    if (!calendar || !door || this.isRefreshingDoor()) {
      return;
    }
    this.isRefreshingDoor.set(true);
    try {
      const refreshedCalendar = await this.calendarService.getCalendar(calendar.id);
      const refreshedDoor = refreshedCalendar.doors.find((item) => item.day === door.day);
      this.calendar.set(refreshedCalendar);
      if (!refreshedDoor) {
        this.doorConflictError.set('Das Türchen konnte nicht aktualisiert werden. Bitte lade den Kalender neu.');
        return;
      }
      this.loadDoorDraft(refreshedDoor);
      this.doorConflictError.set('');
    } catch {
      this.doorConflictError.set('Der Kalender konnte nicht aktualisiert werden. Bitte versuche es erneut.');
    } finally {
      this.isRefreshingDoor.set(false);
    }
  }

  public async shareCalendar(): Promise<void> {
    if (!navigator.share) {
      await this.copySharedUrl();
      return;
    }
    try {
      await navigator.share({ title: 'Adventskalender', url: this.sharedUrl() });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        this.sharingError.set('Der Kalender konnte nicht geteilt werden.');
      }
    }
  }

  public updateDoorField(): void {
    this.onDoorDraftChanged();
  }

  public updateTextBlock(index: number, text: string): void {
    const control = this.doorForm.at(index).controls.text;
    control.setValue(this.normalizeText(text));
    control.markAsDirty();
    this.onDoorDraftChanged();
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

  private getDescriptionFieldError(value: string): string | null {
    if (!value.trim()) {
      return 'Die Beschreibung ist erforderlich.';
    }
    if (value.trim().length > 200) {
      return 'Maximal 200 Zeichen.';
    }
    return null;
  }

  private getTextFieldError(value: string): string | null {
    const count = this.countVisibleCharacters(value);
    if (count === 0) {
      return 'Der Text darf nicht leer sein.';
    }
    if (count > 500) {
      return 'Der Text darf maximal 500 Zeichen enthalten.';
    }
    return null;
  }

  private getTitleFieldError(value: string): string | null {
    if (!value.trim()) {
      return 'Der Titel ist erforderlich.';
    }
    if (value.trim().length > 50) {
      return 'Maximal 50 Zeichen.';
    }
    return null;
  }

  private getUrlFieldError(value: string): string | null {
    if (!value.trim()) {
      return 'Die Adresse ist erforderlich.';
    }
    if (value.length > 50) {
      return 'Die Adresse darf maximal 50 Zeichen enthalten.';
    }
    try {
      const url = new URL(value.trim());
      if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) {
        return 'Bitte gib eine gültige HTTP(S)-Adresse ein.';
      }
    } catch {
      return 'Bitte gib eine gültige HTTP(S)-Adresse ein.';
    }
    return null;
  }

  private handleDoorSaveError(reason: unknown): void {
    const error = reason as HttpErrorResponse;
    const code = error.error?.code;
    const isConflict = error.status === 409 && ['VERSION_CONFLICT', 'CALENDAR_COMPLETED', 'DOOR_OPENED'].includes(code);

    if (error.status === 409 && code === 'VERSION_CONFLICT') {
      this.doorConflictError.set(
        'Der Kalender wurde geändert. Aktualisiere das Türchen, um den aktuellen Stand zu laden.',
      );
      return;
    }

    this.showSnackbar(
      isConflict
        ? 'Das Türchen konnte wegen einer Kalenderänderung nicht gespeichert werden. Bitte lade den Kalender neu.'
        : 'Das Türchen konnte nicht gespeichert werden. Bitte versuche es erneut.',
    );
  }

  private async loadCalendar(id: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const calendar = await this.calendarService.getCalendar(id);
      this.calendar.set(calendar);
      this.form.controls.title.setValue(calendar.title);
      this.form.controls.recipientName.setValue(calendar.recipientName);
      this.form.controls.year.setValue(calendar.year);
      if (calendar.published) {
        try {
          const sharing = await this.calendarService.getSharing(id);
          this.sharedUrl.set(sharing.sharedUrl ? new URL(sharing.sharedUrl, window.location.origin).toString() : '');
        } catch {
          this.sharingError.set('Der Freigabelink konnte nicht geladen werden.');
        }
      }
    } catch {
      this.error.set('Der Kalender konnte nicht geladen werden.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private loadDoorDraft(door: MinAdventDoor): void {
    this.selectedDoorDay.set(door.day);
    this.originalDoorBlocks = this.normalizeBlocks(door.blocks);
    this.doorForm.clear({ emitEvent: false });
    for (const block of this.originalDoorBlocks) {
      const form = this.createBlockForm(
        block.type === MinAdventBlockType.Text ? { ...block, text: this.normalizeText(block.text ?? '') } : block,
      );
      if (block.type === MinAdventBlockType.Text) {
        this.originalTextByForm.set(form, block.text ?? '');
      }
      this.doorForm.push(form, { emitEvent: false });
    }
    this.syncDoorFormReadOnlyState();
    this.doorForm.markAsPristine();
    this.doorDraftRevision.update((revision) => revision + 1);
  }

  private syncDoorFormReadOnlyState(): void {
    if (this.isSelectedDoorReadOnly()) {
      this.doorForm.disable({ emitEvent: false });
    } else {
      this.doorForm.enable({ emitEvent: false });
    }
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

  private normalizeText(value: string): string {
    if (!/<[a-z][^>]*>/i.test(value)) {
      return value.replace(/\r\n?/g, '\n');
    }

    const container = document.createElement('div');
    container.innerHTML = value;
    let text = Array.from(container.childNodes)
      .map((node) => this.textFromNode(node))
      .join('')
      .replaceAll(String.fromCodePoint(160), ' ')
      .replace(/\r\n?/g, '\n')
      .replace(/\n{3,}/g, '\n\n');

    while (text.endsWith('\n')) {
      text = text.slice(0, -1);
    }
    return text;
  }

  private onDoorDraftChanged(): void {
    this.doorDraftRevision.update((revision) => revision + 1);
  }

  private shouldCancelDoorSave(door: MinAdventDoor, blocks: MinAdventBlockDto[]): boolean {
    return (
      this.willCompleteCalendar(door, blocks) && !window.confirm('Dieses Türchen leeren und den Kalender abschließen?')
    );
  }

  private showSnackbar(message: string): void {
    this.snackbarMessage.set(message);
    this.isSnackbarOpen.set(true);
  }

  private textFromNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? '';
    }
    if (node instanceof HTMLBRElement) {
      return '\n';
    }

    const text = Array.from(node.childNodes)
      .map((child) => this.textFromNode(child))
      .join('');
    return node instanceof HTMLElement && ['DIV', 'LI', 'P'].includes(node.tagName) ? `${text}\n` : text;
  }

  private toBlocks(): MinAdventBlockDto[] {
    return this.normalizeBlocks(
      this.doorForm.controls.map((block, index) => {
        const value = block.getRawValue();
        let text = value.text;
        if (value.type === MinAdventBlockType.Text) {
          const originalText = this.originalTextByForm.get(block);
          if (originalText !== undefined && value.text === this.normalizeText(originalText)) {
            text = originalText;
          } else {
            text = this.normalizeText(value.text);
          }
        }
        return { ...value, position: index + 1, text };
      }),
    );
  }

  private visibleText(html: string): string {
    return this.normalizeText(html).trim();
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

type DoorBlockForm = FormGroup<{
  description: FormControl<string>;
  text: FormControl<string>;
  title: FormControl<string>;
  type: FormControl<MinAdventBlockType>;
  url: FormControl<string>;
}>;
