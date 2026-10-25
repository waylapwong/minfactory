import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MINADVENT_ACTIVATED_ROUTE_MOCK } from '../../mocks/minadvent-calendar.component.mock';
import { createMinAdventCalendar } from '../../mocks/minadvent-calendar.mock';
import { MINADVENT_CALENDAR_SERVICE_MOCK } from '../../mocks/minadvent-calendar.service.mock';
import { MinAdventCalendarService } from '../../services/minadvent-calendar.service';
import { MinAdventCalendarComponent } from './minadvent-calendar.component';

describe('MinAdventCalendarComponent', () => {
  let component: MinAdventCalendarComponent;
  let fixture: ComponentFixture<MinAdventCalendarComponent>;

  beforeEach(async () => {
    MINADVENT_ACTIVATED_ROUTE_MOCK.snapshot.paramMap = convertToParamMap({});
    MINADVENT_CALENDAR_SERVICE_MOCK.createCalendar.calls.reset();
    MINADVENT_CALENDAR_SERVICE_MOCK.getCalendar.calls.reset();
    MINADVENT_CALENDAR_SERVICE_MOCK.getSharing.calls.reset();
    MINADVENT_CALENDAR_SERVICE_MOCK.updateCalendar.calls.reset();
    MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor.calls.reset();
    MINADVENT_CALENDAR_SERVICE_MOCK.closeDoor.calls.reset();
    MINADVENT_CALENDAR_SERVICE_MOCK.updateSharing.calls.reset();
    MINADVENT_CALENDAR_SERVICE_MOCK.rotateSharingToken.calls.reset();

    await TestBed.configureTestingModule({
      imports: [MinAdventCalendarComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ActivatedRoute, useValue: MINADVENT_ACTIVATED_ROUTE_MOCK },
        { provide: MinAdventCalendarService, useValue: MINADVENT_CALENDAR_SERVICE_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinAdventCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  describe('ngOnInit()', () => {
    it('should load an existing calendar and populate the form', async () => {
      MINADVENT_CALENDAR_SERVICE_MOCK.getCalendar.and.resolveTo(createMinAdventCalendar());
      MINADVENT_ACTIVATED_ROUTE_MOCK.snapshot.paramMap = convertToParamMap({ id: 'calendar-id' });

      component.ngOnInit();
      await fixture.whenStable();
      component.ngOnInit();
      await fixture.whenStable();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.getCalendar).toHaveBeenCalledWith('calendar-id');
      expect(component.calendar()?.id).toBe('calendar-id');
      expect(component.form.getRawValue()).toEqual({ recipientName: 'Alex', title: 'Adventskalender', year: 2026 });
      expect(component.isLoading()).toBeFalse();
    });

    it('disables metadata fields for a completed calendar', async () => {
      MINADVENT_CALENDAR_SERVICE_MOCK.getCalendar.and.resolveTo(createMinAdventCalendar({ completed: true }));
      MINADVENT_ACTIVATED_ROUTE_MOCK.snapshot.paramMap = convertToParamMap({ id: 'calendar-id' });

      component.ngOnInit();
      await fixture.whenStable();

      expect(component.form.controls.title.disabled).toBeTrue();
      expect(component.form.controls.recipientName.disabled).toBeTrue();
      expect(component.isTitleSaveDisabled()).toBeTrue();
      expect(component.isRecipientSaveDisabled()).toBeTrue();
    });
  });

  describe('getDoorStatusLabel()', () => {
    it('should translate door statuses for display', () => {
      expect(component.getDoorStatusLabel('EMPTY')).toBe('Leer');
      expect(component.getDoorStatusLabel('FILLED')).toBe('Befüllt');
      expect(component.getDoorStatusLabel('OPENED')).toBe('Geöffnet');
    });
  });

  describe('closeDoor()', () => {
    it('closes an opened door and keeps its content available for editing', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar({
        completed: false,
        doors: [
          { blocks: [], day: 1, status: 'FILLED' },
          {
            blocks: [{ position: 1, text: 'Existing text', type: component.MinAdventBlockType.Text }],
            day: 2,
            status: 'OPENED',
          },
        ],
      });
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[1]);
      fixture.detectChanges();
      expect(component.doorForm.disabled).toBeTrue();
      expect((fixture.nativeElement.querySelector('textarea#door-text-0') as HTMLTextAreaElement).disabled).toBeTrue();
      MINADVENT_CALENDAR_SERVICE_MOCK.closeDoor.and.resolveTo({
        completed: false,
        day: 2,
        status: 'FILLED',
        version: 2,
      });

      await component.closeDoor();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.closeDoor).toHaveBeenCalledWith('calendar-id', 2, 1);
      expect(component.selectedDoor()?.status).toBe('FILLED');
      expect(component.isSelectedDoorReadOnly()).toBeFalse();
      expect(component.doorForm.enabled).toBeTrue();
      fixture.detectChanges();
      expect((fixture.nativeElement.querySelector('textarea#door-text-0') as HTMLTextAreaElement).disabled).toBeFalse();
      expect(component.calendar()?.version).toBe(2);
      expect(component.calendar()?.completed).toBeFalse();
    });

    it('does not allow closing an opened door after the calendar is completed', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar({
        completed: true,
      });
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[1]);

      expect(component.canCloseDoor(calendar.doors[1])).toBeFalse();
      await component.closeDoor();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.closeDoor).not.toHaveBeenCalled();
    });
  });

  describe('isPastCalendarYear()', () => {
    it('shows the warning for a calendar from a past year', () => {
      component.calendar.set(createMinAdventCalendar({ year: 1 }));
      fixture.detectChanges();

      expect(component.isPastCalendarYear()).toBeTrue();
      expect(fixture.nativeElement.querySelector('output[aria-live="polite"]')?.textContent).toContain(
        'sofort endgültig abgeschlossen',
      );
    });
  });

  describe('confirmSharingAction()', () => {
    it('publishes an empty calendar using its current version and displays the returned link', async () => {
      const calendar: {
        doors: never[];
        completed: boolean;
        id: string;
        published: boolean;
        recipientName: string;
        title: string;
        version: number;
        year: number;
      } = { ...createMinAdventCalendar(), doors: [] };
      component.calendar.set(calendar);
      component.openSharingDialog('publish');
      MINADVENT_CALENDAR_SERVICE_MOCK.updateSharing.and.resolveTo({
        published: true,
        sharedUrl: '/minadvent/shared/secret-token',
        version: 2,
        completed: false,
      });

      await component.confirmSharingAction();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateSharing).toHaveBeenCalledWith(calendar.id, true, calendar.version);
      expect(component.calendar()?.published).toBeTrue();
      expect(component.calendar()?.version).toBe(2);
      expect(component.sharedUrl()).toBe(`${window.location.origin}/minadvent/shared/secret-token`);
      expect(component.sharingDialogAction()).toBeNull();

      fixture.detectChanges();
      const sharedLink: HTMLAnchorElement = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
      expect(sharedLink.target).toBe('_blank');
      expect(sharedLink.rel).toBe('noopener noreferrer');
    });
  });

  describe('navigateBack()', () => {
    it('should delegate discard confirmation to the route guard', () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.addBlock(component.MinAdventBlockType.Text);
      spyOn(component.routingService, 'navigateToMinAdvent');
      const confirmSpy: jasmine.Spy<((message?: string) => boolean) & ((message?: string) => boolean)> = spyOn(
        window,
        'confirm',
      ).and.returnValue(false);

      component.navigateBack();

      expect(component.routingService.navigateToMinAdvent).toHaveBeenCalled();
      expect(confirmSpy).not.toHaveBeenCalled();
      expect(component.canDeactivate()).toBeFalse();
      expect(confirmSpy).toHaveBeenCalledOnceWith('Ungespeicherte Türchenänderungen verwerfen?');
    });
  });

  describe('saveTitle()', () => {
    it('should save a changed title using the calendar version', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      MINADVENT_CALENDAR_SERVICE_MOCK.updateCalendar.and.resolveTo({ ...calendar, title: 'Neuer Titel' });
      component.calendar.set(calendar);
      component.form.controls.title.setValue('Neuer Titel');

      await component.saveTitle();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateCalendar).toHaveBeenCalledWith('calendar-id', {
        expectedVersion: 1,
        title: 'Neuer Titel',
      });
      expect(component.calendar()?.title).toBe('Neuer Titel');
      expect(component.isSavingTitle()).toBeFalse();
    });

    it('should not save an unchanged title', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.form.controls.title.setValue(calendar.title);

      await component.saveTitle();

      expect(component.isTitleSaveDisabled()).toBeTrue();
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateCalendar).not.toHaveBeenCalled();
    });

    it('should not save an unchanged title', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.form.controls.title.setValue(calendar.title);

      await component.saveTitle();

      expect(component.isTitleSaveDisabled()).toBeTrue();
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateCalendar).not.toHaveBeenCalled();
    });
  });

  describe('saveRecipient()', () => {
    it('should save a changed recipient using the calendar version', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      MINADVENT_CALENDAR_SERVICE_MOCK.updateCalendar.and.resolveTo({ ...calendar, recipientName: 'Sam' });
      component.calendar.set(calendar);
      component.form.controls.recipientName.setValue('Sam');

      await component.saveRecipient();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateCalendar).toHaveBeenCalledWith('calendar-id', {
        expectedVersion: 1,
        recipientName: 'Sam',
      });
      expect(component.calendar()?.recipientName).toBe('Sam');
      expect(component.isSavingRecipient()).toBeFalse();
    });

    it('should not save an unchanged recipient', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.form.controls.recipientName.setValue(calendar.recipientName);

      await component.saveRecipient();

      expect(component.isRecipientSaveDisabled()).toBeTrue();
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateCalendar).not.toHaveBeenCalled();
    });
  });

  describe('selectDoor()', () => {
    it('loads a door draft and warns before replacing unsaved changes', () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      fixture.detectChanges();
      (fixture.nativeElement.querySelector('[aria-label="Türchen 1, Status Befüllt"]') as HTMLButtonElement).click();
      fixture.detectChanges(false);
      expect(fixture.nativeElement.querySelector('[aria-modal="true"]')).toBeTruthy();
      component.addBlock(component.MinAdventBlockType.Text);
      component.updateTextBlock(0, '<p>Draft</p>');
      spyOn(window, 'confirm').and.returnValue(false);

      component.selectDoor(calendar.doors[1]);

      expect(component.selectedDoorDay()).toBe(1);
      expect(component.doorForm).toHaveSize(1);
      expect(component.hasUnsavedDoorChanges()).toBeTrue();
      expect(window.confirm).toHaveBeenCalledWith('Ungespeicherte Türchenänderungen verwerfen?');
    });

    it('renders a native type select and multiline text area without rich-text editing', () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.addBlock(component.MinAdventBlockType.Text);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('min-advent-select select')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('min-select')).toBeNull();
      expect(fixture.nativeElement.querySelector('textarea#door-text-0')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('[contenteditable="true"]')).toBeNull();
    });
  });

  describe('updateTextBlock()', () => {
    it('converts legacy paragraph markup to plain text with preserved line breaks', () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.addBlock(component.MinAdventBlockType.Text);

      component.updateTextBlock(0, '<p>Erste Zeile</p><p><br></p><p>Zweite Zeile</p>');

      expect(component.doorForm.at(0).controls.text.value).toBe('Erste Zeile\n\nZweite Zeile');
    });
  });

  describe('formatted text preservation', () => {
    it('preserves existing formatted text when another block changes', async () => {
      const formattedText: string = '<p><strong>Keep</strong> the formatting</p>';
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar({
        doors: [
          {
            blocks: [{ position: 1, text: formattedText, type: component.MinAdventBlockType.Text }],
            day: 1,
            status: 'FILLED',
          },
          { blocks: [], day: 2, status: 'OPENED' },
        ],
      });
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      expect(component.doorForm.at(0).controls.text.value).toBe('Keep the formatting');
      component.addBlock(component.MinAdventBlockType.Text);
      component.updateTextBlock(1, 'Another block');
      MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor.and.resolveTo({
        completed: false,
        day: 1,
        status: 'FILLED',
        version: 2,
      });

      await component.saveDoor();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor).toHaveBeenCalledWith('calendar-id', 1, {
        expectedVersion: 1,
        blocks: [
          { position: 1, text: formattedText, type: component.MinAdventBlockType.Text },
          { position: 2, text: 'Another block', type: component.MinAdventBlockType.Text },
        ],
      });
    });
  });

  describe('saveDoor() conflict recovery', () => {
    it('shows a refresh action and replaces the draft with the opened door after refresh', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      const refreshedCalendar: import('../../models/minadvent-calendar.model').MinAdventCalendar =
        createMinAdventCalendar({
          version: 2,
          doors: [
            {
              blocks: [{ position: 1, text: 'Server content', type: component.MinAdventBlockType.Text }],
              day: 1,
              status: 'OPENED',
            },
            { blocks: [], day: 2, status: 'OPENED' },
          ],
        });
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.addBlock(component.MinAdventBlockType.Text);
      component.updateTextBlock(0, 'Keep this');
      MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor.and.rejectWith(
        Object.assign(new Error('Version conflict'), { status: 409, error: { code: 'VERSION_CONFLICT' } }),
      );
      MINADVENT_CALENDAR_SERVICE_MOCK.getCalendar.and.resolveTo(refreshedCalendar);
      const confirmSpy: jasmine.Spy<((message?: string) => boolean) & ((message?: string) => boolean)> = spyOn(
        window,
        'confirm',
      );

      await component.saveDoor();

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(component.doorConflictError()).toContain('Der Kalender wurde geändert.');
      expect(component.doorForm.at(0).controls.text.value).toBe('Keep this');
      expect(component.hasUnsavedDoorChanges()).toBeTrue();
      fixture.detectChanges();
      const refreshButton: HTMLButtonElement = Array.from(
        fixture.nativeElement.querySelectorAll('min-button button') as NodeListOf<HTMLButtonElement>,
      ).find((button) => button.textContent.trim() === 'Türchen aktualisieren') as HTMLButtonElement;
      refreshButton.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.getCalendar).toHaveBeenCalledWith(calendar.id);
      expect(component.calendar()?.version).toBe(2);
      expect(component.selectedDoor()?.status).toBe('OPENED');
      expect(component.doorForm.at(0).controls.text.value).toBe('Server content');
      expect(component.doorForm.disabled).toBeTrue();
      expect(component.hasUnsavedDoorChanges()).toBeFalse();
      expect(component.selectedDoorDay()).toBe(1);
    });
  });

  describe('closeDoorDialog()', () => {
    it('should keep the dialog open when discarding a draft is cancelled', () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      fixture.detectChanges();
      (fixture.nativeElement.querySelector('[aria-label="Türchen 1, Status Befüllt"]') as HTMLButtonElement).click();
      fixture.detectChanges(false);
      component.addBlock(component.MinAdventBlockType.Text);
      spyOn(window, 'confirm').and.returnValue(false);

      component.closeDoorDialog();
      fixture.detectChanges(false);

      expect(fixture.nativeElement.querySelector('[aria-modal="true"]')).toBeTruthy();
      expect(component.selectedDoorDay()).toBe(1);
      expect(component.hasUnsavedDoorChanges()).toBeTrue();
    });
  });

  describe('saveDoor()', () => {
    it('should disable saving unchanged doors and reject empty required text', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);

      expect(component.isDoorSaveDisabled()).toBeTrue();
      await component.saveDoor();
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor).not.toHaveBeenCalled();

      component.addBlock(component.MinAdventBlockType.Text);
      expect(component.isDoorSaveDisabled()).toBeTrue();
      expect(component.getDoorFieldError(0, 'text')).toBe('Der Text darf nicht leer sein.');
      await component.saveDoor();

      expect(component.doorForm.at(0).controls.text.touched).toBeTrue();
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor).not.toHaveBeenCalled();
      component.updateTextBlock(0, 'Ein valider Text');
      expect(component.isDoorSaveDisabled()).toBeFalse();
    });

    it('should report empty link and voucher fields', () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.addBlock(component.MinAdventBlockType.Link);

      expect(component.getDoorFieldError(0, 'title')).toBe('Der Titel ist erforderlich.');
      expect(component.getDoorFieldError(0, 'url')).toBe('Die Adresse ist erforderlich.');

      component.removeBlock(0);
      component.addBlock(component.MinAdventBlockType.Voucher);
      expect(component.getDoorFieldError(0, 'description')).toBe('Die Beschreibung ist erforderlich.');
    });

    it('saves the complete block list and adopts global version and status', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.addBlock(component.MinAdventBlockType.Text);
      component.updateTextBlock(0, 'Eine Überraschung\n\nNoch eine Zeile');
      MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor.and.resolveTo({
        completed: false,
        day: 1,
        status: 'FILLED',
        version: 2,
      });

      await component.saveDoor();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor).toHaveBeenCalledWith('calendar-id', 1, {
        expectedVersion: 1,
        blocks: [
          { position: 1, text: 'Eine Überraschung\n\nNoch eine Zeile', type: component.MinAdventBlockType.Text },
        ],
      });
      expect(component.calendar()?.version).toBe(2);
      expect(component.calendar()?.doors[0].status).toBe('FILLED');
      expect(component.hasUnsavedDoorChanges()).toBeFalse();
      expect(component.selectedDoorDay()).toBeNull();
      expect(component.isSnackbarOpen()).toBeTrue();
      expect(component.snackbarMessage()).toBe('Türchen gespeichert.');
    });

    it('asks before clearing the last filled door and keeps the draft when cancelled', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar({
        year: 1,
        doors: [
          {
            blocks: [{ position: 1, text: 'Surprise', type: component.MinAdventBlockType.Text }],
            day: 1,
            status: 'FILLED',
          },
          { blocks: [], day: 2, status: 'OPENED' },
          ...Array.from({ length: 22 }, (_, index) => ({ blocks: [], day: index + 3, status: 'EMPTY' as const })),
        ],
      });
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.removeBlock(0);
      const confirmSpy: jasmine.Spy<((message?: string) => boolean) & ((message?: string) => boolean)> = spyOn(
        window,
        'confirm',
      ).and.returnValue(false);

      await component.saveDoor();

      expect(confirmSpy).toHaveBeenCalledWith('Dieses Türchen leeren und den Kalender abschließen?');
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor).not.toHaveBeenCalled();
      expect(component.hasUnsavedDoorChanges()).toBeTrue();
    });

    it('adopts the completed status and incremented version after clearing the last filled door', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar({
        year: 1,
        doors: [
          {
            blocks: [{ position: 1, text: 'Surprise', type: component.MinAdventBlockType.Text }],
            day: 1,
            status: 'FILLED',
          },
          { blocks: [], day: 2, status: 'OPENED' },
          ...Array.from({ length: 22 }, (_, index) => ({ blocks: [], day: index + 3, status: 'EMPTY' as const })),
        ],
      });
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.removeBlock(0);
      spyOn(window, 'confirm').and.returnValue(true);
      MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor.and.resolveTo({
        completed: true,
        day: 1,
        status: 'EMPTY',
        version: calendar.version + 1,
      });

      await component.saveDoor();

      expect(component.calendar()?.completed).toBeTrue();
      expect(component.calendar()?.version).toBe(calendar.version + 1);
      expect(component.calendar()?.doors[0].status).toBe('EMPTY');
    });

    it('preserves the local draft after a version conflict without confirmation', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.addBlock(component.MinAdventBlockType.Text);
      component.updateTextBlock(0, 'Keep this');
      MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor.and.rejectWith(
        Object.assign(new Error('Version conflict'), { status: 409, error: { code: 'VERSION_CONFLICT' } }),
      );
      const confirmSpy: jasmine.Spy<((message?: string) => boolean) & ((message?: string) => boolean)> = spyOn(
        window,
        'confirm',
      );
      await component.saveDoor();

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(component.doorConflictError()).toContain('Der Kalender wurde geändert.');
      expect(component.doorForm.at(0).controls.text.value).toBe('Keep this');
      expect(component.hasUnsavedDoorChanges()).toBeTrue();
      expect(component.selectedDoorDay()).toBe(1);
      expect(component.isSnackbarOpen()).toBeFalse();
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.getCalendar).not.toHaveBeenCalled();
    });

    it('should not save an unchanged recipient', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.form.controls.recipientName.setValue(calendar.recipientName);

      await component.saveRecipient();

      expect(component.isRecipientSaveDisabled()).toBeTrue();
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateCalendar).not.toHaveBeenCalled();
    });
  });

  describe('selectDoor()', () => {
    it('loads a door draft and warns before replacing unsaved changes', () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      fixture.detectChanges();
      (fixture.nativeElement.querySelector('[aria-label="Türchen 1, Status Befüllt"]') as HTMLButtonElement).click();
      fixture.detectChanges(false);
      expect(fixture.nativeElement.querySelector('[aria-modal="true"]')).toBeTruthy();
      component.addBlock(component.MinAdventBlockType.Text);
      component.updateTextBlock(0, '<p>Draft</p>');
      spyOn(window, 'confirm').and.returnValue(false);

      component.selectDoor(calendar.doors[1]);

      expect(component.selectedDoorDay()).toBe(1);
      expect(component.doorForm).toHaveSize(1);
      expect(component.hasUnsavedDoorChanges()).toBeTrue();
      expect(window.confirm).toHaveBeenCalledWith('Ungespeicherte Türchenänderungen verwerfen?');
    });

    it('renders a native type select and multiline text area without rich-text editing', () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.addBlock(component.MinAdventBlockType.Text);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('min-advent-select select')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('min-select')).toBeNull();
      expect(fixture.nativeElement.querySelector('textarea#door-text-0')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('[contenteditable="true"]')).toBeNull();
    });
  });

  describe('updateTextBlock()', () => {
    it('converts legacy paragraph markup to plain text with preserved line breaks', () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.addBlock(component.MinAdventBlockType.Text);

      component.updateTextBlock(0, '<p>Erste Zeile</p><p><br></p><p>Zweite Zeile</p>');

      expect(component.doorForm.at(0).controls.text.value).toBe('Erste Zeile\n\nZweite Zeile');
    });
  });

  describe('closeDoorDialog()', () => {
    it('should keep the dialog open when discarding a draft is cancelled', () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      fixture.detectChanges();
      (fixture.nativeElement.querySelector('[aria-label="Türchen 1, Status Befüllt"]') as HTMLButtonElement).click();
      fixture.detectChanges(false);
      component.addBlock(component.MinAdventBlockType.Text);
      spyOn(window, 'confirm').and.returnValue(false);

      component.closeDoorDialog();
      fixture.detectChanges(false);

      expect(fixture.nativeElement.querySelector('[aria-modal="true"]')).toBeTruthy();
      expect(component.selectedDoorDay()).toBe(1);
      expect(component.hasUnsavedDoorChanges()).toBeTrue();
    });
  });

  describe('saveDoor()', () => {
    it('should disable saving unchanged doors and reject empty required text', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);

      expect(component.isDoorSaveDisabled()).toBeTrue();
      await component.saveDoor();
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor).not.toHaveBeenCalled();

      component.addBlock(component.MinAdventBlockType.Text);
      expect(component.isDoorSaveDisabled()).toBeTrue();
      expect(component.getDoorFieldError(0, 'text')).toBe('Der Text darf nicht leer sein.');
      await component.saveDoor();

      expect(component.doorForm.at(0).controls.text.touched).toBeTrue();
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor).not.toHaveBeenCalled();
      component.updateTextBlock(0, 'Ein valider Text');
      expect(component.isDoorSaveDisabled()).toBeFalse();
    });

    it('should report empty link and voucher fields', () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.addBlock(component.MinAdventBlockType.Link);

      expect(component.getDoorFieldError(0, 'title')).toBe('Der Titel ist erforderlich.');
      expect(component.getDoorFieldError(0, 'url')).toBe('Die Adresse ist erforderlich.');

      component.removeBlock(0);
      component.addBlock(component.MinAdventBlockType.Voucher);
      expect(component.getDoorFieldError(0, 'description')).toBe('Die Beschreibung ist erforderlich.');
    });

    it('saves the complete block list and adopts global version and status', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.addBlock(component.MinAdventBlockType.Text);
      component.updateTextBlock(0, 'Eine Überraschung\n\nNoch eine Zeile');
      MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor.and.resolveTo({
        completed: false,
        day: 1,
        status: 'FILLED',
        version: 2,
      });

      await component.saveDoor();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor).toHaveBeenCalledWith('calendar-id', 1, {
        expectedVersion: 1,
        blocks: [
          { position: 1, text: 'Eine Überraschung\n\nNoch eine Zeile', type: component.MinAdventBlockType.Text },
        ],
      });
      expect(component.calendar()?.version).toBe(2);
      expect(component.calendar()?.doors[0].status).toBe('FILLED');
      expect(component.hasUnsavedDoorChanges()).toBeFalse();
      expect(component.selectedDoorDay()).toBeNull();
      expect(component.isSnackbarOpen()).toBeTrue();
      expect(component.snackbarMessage()).toBe('Türchen gespeichert.');
    });

    it('preserves the local draft after a version conflict without confirmation', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.addBlock(component.MinAdventBlockType.Text);
      component.updateTextBlock(0, 'Keep this');
      MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor.and.rejectWith(
        Object.assign(new Error('Version conflict'), { status: 409, error: { code: 'VERSION_CONFLICT' } }),
      );
      const confirmSpy: jasmine.Spy<((message?: string) => boolean) & ((message?: string) => boolean)> = spyOn(
        window,
        'confirm',
      );
      await component.saveDoor();

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(component.doorConflictError()).toContain('Der Kalender wurde geändert.');
      expect(component.doorForm.at(0).controls.text.value).toBe('Keep this');
      expect(component.hasUnsavedDoorChanges()).toBeTrue();
      expect(component.selectedDoorDay()).toBe(1);
      expect(component.isSnackbarOpen()).toBeFalse();
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.getCalendar).not.toHaveBeenCalled();
    });
  });
});
