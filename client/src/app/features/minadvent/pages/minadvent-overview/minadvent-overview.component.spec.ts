import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ROUTING_SERVICE_MOCK } from '../../../../core/routing/mocks/routing.service.mock';
import { RoutingService } from '../../../../core/routing/services/routing.service';
import { createMinAdventCalendar } from '../../mocks/minadvent-calendar.mock';
import {
  MINADVENT_CALENDARS_SIGNAL,
  MINADVENT_CALENDAR_SERVICE_MOCK,
} from '../../mocks/minadvent-calendar.service.mock';
import { MinAdventCalendarService } from '../../services/minadvent-calendar.service';
import { MinAdventOverviewComponent } from './minadvent-overview.component';

describe('MinAdventOverviewComponent', () => {
  let component: MinAdventOverviewComponent;
  let fixture: ComponentFixture<MinAdventOverviewComponent>;

  beforeEach(async () => {
    MINADVENT_CALENDARS_SIGNAL.set([]);
    MINADVENT_CALENDAR_SERVICE_MOCK.loadCalendars.calls.reset();
    MINADVENT_CALENDAR_SERVICE_MOCK.createCalendar.calls.reset();
    MINADVENT_CALENDAR_SERVICE_MOCK.deleteCalendar.calls.reset();
    MINADVENT_CALENDAR_SERVICE_MOCK.loadCalendars.and.resolveTo();
    ROUTING_SERVICE_MOCK.navigateToMinAdventCalendar.calls.reset();
    ROUTING_SERVICE_MOCK.navigateToApps.calls.reset();
    ROUTING_SERVICE_MOCK.navigateToMinAdventCreate.calls.reset();
    ROUTING_SERVICE_MOCK.navigateToMinAdventCalendar.calls.reset();

    await TestBed.configureTestingModule({
      imports: [MinAdventOverviewComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinAdventCalendarService, useValue: MINADVENT_CALENDAR_SERVICE_MOCK },
        { provide: RoutingService, useValue: ROUTING_SERVICE_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinAdventOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  describe('ngOnInit()', () => {
    it('should load calendars on initialization and finish loading', () => {
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.loadCalendars).toHaveBeenCalled();
      expect(component.isLoading()).toBeFalse();
    });
  });

  describe('groups()', () => {
    it('should group calendars by year with the current year first and remaining years descending', () => {
      const currentYear: number = new Date().getFullYear();
      MINADVENT_CALENDARS_SIGNAL.set([
        createMinAdventCalendar({ id: 'older', year: currentYear - 2 }),
        createMinAdventCalendar({ id: 'current', year: currentYear }),
        createMinAdventCalendar({ id: 'newer', year: currentYear - 1 }),
      ]);

      expect(component.groups().map((group) => group.year)).toEqual([currentYear, currentYear - 1, currentYear - 2]);
      expect(component.groups()[0].calendars[0].id).toBe('current');
    });
  });

  describe('loadCalendars()', () => {
    it('should expose a readable error and stop loading when calendar loading fails', async () => {
      MINADVENT_CALENDAR_SERVICE_MOCK.loadCalendars.and.rejectWith(new Error('Unavailable'));

      await component.loadCalendars();

      expect(component.error()).toBe('Deine Kalender konnten nicht geladen werden. Bitte versuche es erneut.');
      expect(component.isLoading()).toBeFalse();
    });

    it('should clear the previous loading error when a retry succeeds', async () => {
      MINADVENT_CALENDAR_SERVICE_MOCK.loadCalendars.and.rejectWith(new Error('Unavailable'));
      await component.loadCalendars();
      MINADVENT_CALENDAR_SERVICE_MOCK.loadCalendars.and.resolveTo();

      await component.loadCalendars();

      expect(component.error()).toBe('');
      expect(component.isLoading()).toBeFalse();
    });
  });

  describe('createCalendar()', () => {
    it('opens the shared dialog from the create button', () => {
      fixture.nativeElement.querySelector('[aria-label="Kalender anlegen"]').click();
      fixture.detectChanges();

      expect(component.isCreateDialogOpen()).toBeTrue();
      expect(fixture.nativeElement.querySelector('[aria-modal="true"]')).toBeTruthy();
    });

    it('creates a valid calendar and navigates to its detail page', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      MINADVENT_CALENDAR_SERVICE_MOCK.createCalendar.and.resolveTo(calendar);
      component.createForm.setValue({ recipientName: 'Alex', title: 'Adventskalender', year: 2026 });

      await component.createCalendar();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.createCalendar).toHaveBeenCalledWith({
        recipientName: 'Alex',
        title: 'Adventskalender',
        year: 2026,
      });
      expect(ROUTING_SERVICE_MOCK.navigateToMinAdventCalendar).toHaveBeenCalledWith(calendar.id);
      expect(component.isCreateDialogOpen()).toBeFalse();
    });

    it('does not create an invalid calendar', async () => {
      await component.createCalendar();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.createCalendar).not.toHaveBeenCalled();
      expect(component.createForm.controls.title.touched).toBeTrue();
      expect(component.createForm.controls.recipientName.touched).toBeTrue();
    });

    it('shows the completion warning when the selected calendar year is in the past', () => {
      component.createForm.controls.year.setValue(1);
      component.openCreateDialog();
      fixture.detectChanges();

      expect(component.isPastCalendarYear()).toBeTrue();
      expect(fixture.nativeElement.querySelector('output[aria-live="polite"]')?.textContent).toContain(
        'sofort endgültig abgeschlossen',
      );
    });
  });

  describe('createCalendar()', () => {
    it('opens the shared dialog from the create button', () => {
      fixture.nativeElement.querySelector('[aria-label="Kalender anlegen"]').click();
      fixture.detectChanges();

      expect(component.isCreateDialogOpen()).toBeTrue();
      expect(fixture.nativeElement.querySelector('[aria-modal="true"]')).toBeTruthy();
    });

    it('creates a valid calendar and navigates to its detail page', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar();
      MINADVENT_CALENDAR_SERVICE_MOCK.createCalendar.and.resolveTo(calendar);
      component.createForm.setValue({ recipientName: 'Alex', title: 'Adventskalender', year: 2026 });

      await component.createCalendar();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.createCalendar).toHaveBeenCalledWith({
        recipientName: 'Alex',
        title: 'Adventskalender',
        year: 2026,
      });
      expect(ROUTING_SERVICE_MOCK.navigateToMinAdventCalendar).toHaveBeenCalledWith(calendar.id);
      expect(component.isCreateDialogOpen()).toBeFalse();
    });

    it('does not create an invalid calendar', async () => {
      await component.createCalendar();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.createCalendar).not.toHaveBeenCalled();
      expect(component.createForm.controls.title.touched).toBeTrue();
      expect(component.createForm.controls.recipientName.touched).toBeTrue();
    });
  });

  describe('deleteCalendar()', () => {
    it('opens delete confirmation without navigating when the card delete button is clicked', () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar({
        id: 'calendar-to-delete',
      });
      MINADVENT_CALENDARS_SIGNAL.set([calendar]);
      fixture.detectChanges();
      const deleteButton: HTMLButtonElement = fixture.nativeElement.querySelector(
        'min-card-button button[aria-label="Kalender endgültig löschen"]',
      ) as HTMLButtonElement;

      deleteButton.click();
      fixture.detectChanges();

      expect(component.calendarToDelete()).toBe(calendar);
      expect(component.isCreateDialogOpen()).toBeFalse();
      expect(ROUTING_SERVICE_MOCK.navigateToMinAdventCalendar).not.toHaveBeenCalled();
    });

    it('confirms deletion with the calendar version and closes the dialog after success', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar({
        id: 'calendar-to-delete',
        version: 7,
      });
      component.openDeleteDialog(calendar, new MouseEvent('click'));
      MINADVENT_CALENDAR_SERVICE_MOCK.deleteCalendar.and.resolveTo();

      await component.confirmDeleteCalendar();

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.deleteCalendar).toHaveBeenCalledWith(calendar.id, 7);
      expect(component.calendarToDelete()).toBeNull();
    });

    it('keeps the confirmation open and shows an error when deletion fails', async () => {
      const calendar: import('../../models/minadvent-calendar.model').MinAdventCalendar = createMinAdventCalendar({
        id: 'calendar-to-delete',
      });
      component.openDeleteDialog(calendar, new MouseEvent('click'));
      MINADVENT_CALENDAR_SERVICE_MOCK.deleteCalendar.and.rejectWith(new Error('Version conflict'));

      await component.confirmDeleteCalendar();

      expect(component.calendarToDelete()).toBe(calendar);
      expect(component.deleteError()).toContain('Der Kalender konnte nicht gelöscht werden');
    });
  });
});
