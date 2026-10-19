import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MINADVENT_ACTIVATED_ROUTE_MOCK, MINADVENT_ROUTER_MOCK } from '../../mocks/minadvent-calendar.component.mock';
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
    MINADVENT_ROUTER_MOCK.navigate.calls.reset();
    MINADVENT_ROUTER_MOCK.navigate.and.resolveTo(true);

    await TestBed.configureTestingModule({
      imports: [MinAdventCalendarComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ActivatedRoute, useValue: MINADVENT_ACTIVATED_ROUTE_MOCK },
        { provide: Router, useValue: MINADVENT_ROUTER_MOCK },
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
      expect(component.isEditing()).toBeTrue();
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

  describe('createCalendar()', () => {
    it('should not create a calendar when the form is invalid', async () => {
      await component.createCalendar();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.createCalendar).not.toHaveBeenCalled();
      expect(component.form.controls.title.touched).toBeTrue();
      expect(component.form.controls.recipientName.touched).toBeTrue();
    });

    it('should create a calendar and navigate to it when the form is valid', async () => {
      const calendar = createMinAdventCalendar();
      MINADVENT_CALENDAR_SERVICE_MOCK.createCalendar.and.resolveTo(calendar);
      component.form.setValue({ recipientName: 'Alex', title: 'Adventskalender', year: 2026 });

      await component.createCalendar();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.createCalendar).toHaveBeenCalledWith({
        recipientName: 'Alex',
        title: 'Adventskalender',
        year: 2026,
      });
      expect(MINADVENT_ROUTER_MOCK.navigate).toHaveBeenCalledWith(['/minadvent/calendars', calendar.id]);
      expect(component.isLoading()).toBeFalse();
    });

    it('should display an error when calendar creation fails', async () => {
      MINADVENT_CALENDAR_SERVICE_MOCK.createCalendar.and.rejectWith(new Error('Unavailable'));
      component.form.setValue({ recipientName: 'Alex', title: 'Adventskalender', year: 2026 });

      await component.createCalendar();

      expect(component.error()).toBe('Der Kalender konnte nicht angelegt werden. Bitte prüfe deine Eingaben.');
      expect(component.isLoading()).toBeFalse();
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
  });

  describe('selectDoor()', () => {
    it('loads a door draft and warns before replacing unsaved changes', () => {
      const calendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.isEditing.set(true);
      fixture.detectChanges();
      (fixture.nativeElement.querySelector('[aria-label="Türchen 1, Status Befüllt"]') as HTMLButtonElement).click();
      fixture.detectChanges(false);
      expect((fixture.nativeElement.querySelector('dialog') as HTMLDialogElement).open).toBeTrue();
      component.addBlock(component.MinAdventBlockType.Text);
      component.updateTextBlock(0, '<p>Draft</p>');
      spyOn(window, 'confirm').and.returnValue(false);

      component.selectDoor(calendar.doors[1]);

      expect(component.selectedDoorDay()).toBe(1);
      expect(component.doorForm).toHaveSize(1);
      expect(component.hasUnsavedDoorChanges()).toBeTrue();
      expect(window.confirm).toHaveBeenCalledWith('Ungespeicherte Türchenänderungen verwerfen?');
    });
  });

  describe('closeDoorDialog()', () => {
    it('should keep the dialog open when discarding a draft is cancelled', () => {
      const calendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.isEditing.set(true);
      fixture.detectChanges();
      (fixture.nativeElement.querySelector('[aria-label="Türchen 1, Status Befüllt"]') as HTMLButtonElement).click();
      component.addBlock(component.MinAdventBlockType.Text);
      spyOn(window, 'confirm').and.returnValue(false);

      component.closeDoorDialog();

      expect((fixture.nativeElement.querySelector('dialog') as HTMLDialogElement).open).toBeTrue();
      expect(component.selectedDoorDay()).toBe(1);
      expect(component.hasUnsavedDoorChanges()).toBeTrue();
    });
  });

  describe('saveDoor()', () => {
    it('saves the complete block list and adopts global version and status', async () => {
      const calendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.addBlock(component.MinAdventBlockType.Text);
      component.updateTextBlock(0, '<p>Eine Überraschung</p>');
      MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor.and.resolveTo({
        completed: false,
        day: 1,
        status: 'FILLED',
        version: 2,
      });

      await component.saveDoor();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor).toHaveBeenCalledWith('calendar-id', 1, {
        expectedVersion: 1,
        blocks: [{ position: 1, text: '<p>Eine Überraschung</p>', type: component.MinAdventBlockType.Text }],
      });
      expect(component.calendar()?.version).toBe(2);
      expect(component.selectedDoor()?.status).toBe('FILLED');
      expect(component.hasUnsavedDoorChanges()).toBeFalse();
    });

    it('preserves the local draft after a version conflict without confirmation', async () => {
      const calendar = createMinAdventCalendar();
      component.calendar.set(calendar);
      component.selectDoor(calendar.doors[0]);
      component.addBlock(component.MinAdventBlockType.Text);
      component.updateTextBlock(0, '<p>Keep this</p>');
      MINADVENT_CALENDAR_SERVICE_MOCK.updateDoor.and.rejectWith(
        Object.assign(new Error('Version conflict'), { status: 409, error: { code: 'VERSION_CONFLICT' } }),
      );
      spyOn(window, 'confirm').and.returnValue(false);

      await component.saveDoor();

      expect(component.doorForm.at(0).controls.text.value).toBe('<p>Keep this</p>');
      expect(component.hasUnsavedDoorChanges()).toBeTrue();
      expect(component.doorError()).toContain('Dein Entwurf bleibt erhalten');
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.getCalendar).not.toHaveBeenCalled();
    });
  });
});
