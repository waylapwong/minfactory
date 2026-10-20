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
    MINADVENT_CALENDAR_SERVICE_MOCK.updateCalendar.calls.reset();
    MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor.calls.reset();

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

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.getCalendar).toHaveBeenCalledWith('calendar-id');
      expect(component.calendar()?.id).toBe('calendar-id');
      expect(component.form.getRawValue()).toEqual({ recipientName: 'Alex', title: 'Adventskalender', year: 2026 });
      expect(component.isLoading()).toBeFalse();
    });
  });

  describe('getDoorStatusLabel()', () => {
    it('should translate door statuses for display', () => {
      expect(component.getDoorStatusLabel('EMPTY')).toBe('Leer');
      expect(component.getDoorStatusLabel('FILLED')).toBe('Befüllt');
      expect(component.getDoorStatusLabel('OPENED')).toBe('Geöffnet');
    });
  });

  describe('saveTitle()', () => {
    it('should save a changed title using the calendar version', async () => {
      const calendar = createMinAdventCalendar();
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
      const calendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.form.controls.title.setValue(calendar.title);

      await component.saveTitle();

      expect(component.isTitleSaveDisabled()).toBeTrue();
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateCalendar).not.toHaveBeenCalled();
    });
  });

  describe('saveRecipient()', () => {
    it('should save a changed recipient using the calendar version', async () => {
      const calendar = createMinAdventCalendar();
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
      const calendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.form.controls.recipientName.setValue(calendar.recipientName);

      await component.saveRecipient();

      expect(component.isRecipientSaveDisabled()).toBeTrue();
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateCalendar).not.toHaveBeenCalled();
    });
  });

  describe('selectDoor()', () => {
    it('loads a door draft and warns before replacing unsaved changes', () => {
      const calendar = createMinAdventCalendar();
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
      const calendar = createMinAdventCalendar();
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
      const calendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.addBlock(component.MinAdventBlockType.Text);

      component.updateTextBlock(0, '<p>Erste Zeile</p><p><br></p><p>Zweite Zeile</p>');

      expect(component.doorForm.at(0).controls.text.value).toBe('Erste Zeile\n\nZweite Zeile');
    });
  });

  describe('closeDoorDialog()', () => {
    it('should keep the dialog open when discarding a draft is cancelled', () => {
      const calendar = createMinAdventCalendar();
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
      const calendar = createMinAdventCalendar();
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
      const calendar = createMinAdventCalendar();
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
      const calendar = createMinAdventCalendar();
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
      const calendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.addBlock(component.MinAdventBlockType.Text);
      component.updateTextBlock(0, 'Keep this');
      MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor.and.rejectWith(
        Object.assign(new Error('Version conflict'), { status: 409, error: { code: 'VERSION_CONFLICT' } }),
      );
      await component.saveDoor();

      expect(component.doorForm.at(0).controls.text.value).toBe('Keep this');
      expect(component.hasUnsavedDoorChanges()).toBeTrue();
      expect(component.selectedDoorDay()).toBe(1);
      expect(component.isSnackbarOpen()).toBeTrue();
      expect(component.snackbarMessage()).toContain('nicht gespeichert');
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.getCalendar).not.toHaveBeenCalled();
    });
  });
});
