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

      await component.ngOnInit();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.getCalendar).toHaveBeenCalledWith('calendar-id');
      expect(component.isEditing()).toBeTrue();
      expect(component.calendar()?.id).toBe('calendar-id');
      expect(component.form.getRawValue()).toEqual({ recipientName: 'Alex', title: 'Adventskalender', year: 2026 });
      expect(component.isLoading()).toBeFalse();
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
});
