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
    MINADVENT_CALENDAR_SERVICE_MOCK.loadCalendars.and.resolveTo();
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
      const currentYear = new Date().getFullYear();
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
  });
});
