import { HttpErrorResponse } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MINADVENT_ACTIVATED_ROUTE_MOCK } from '../../mocks/minadvent-calendar.component.mock';
import { createMinAdventSharedCalendarDto } from '../../mocks/minadvent-calendar.mock';
import { MINADVENT_CALENDAR_SERVICE_MOCK } from '../../mocks/minadvent-calendar.service.mock';
import { MinAdventCalendarService } from '../../services/minadvent-calendar.service';
import { MinAdventSharedCalendarComponent } from './minadvent-shared-calendar.component';

describe('MinAdventSharedCalendarComponent', () => {
  let component: MinAdventSharedCalendarComponent;
  let fixture: ComponentFixture<MinAdventSharedCalendarComponent>;

  beforeEach(async () => {
    MINADVENT_ACTIVATED_ROUTE_MOCK.snapshot.paramMap = convertToParamMap({ token: 'shared-token' });
    MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar.calls.reset();
    MINADVENT_CALENDAR_SERVICE_MOCK.getSharedDoor.calls.reset();
    MINADVENT_CALENDAR_SERVICE_MOCK.openSharedDoor.calls.reset();

    await TestBed.configureTestingModule({
      imports: [MinAdventSharedCalendarComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ActivatedRoute, useValue: MINADVENT_ACTIVATED_ROUTE_MOCK },
        { provide: MinAdventCalendarService, useValue: MINADVENT_CALENDAR_SERVICE_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinAdventSharedCalendarComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    MINADVENT_ACTIVATED_ROUTE_MOCK.snapshot.paramMap = convertToParamMap({});
  });

  describe('ngOnInit()', () => {
    it('shows a loading state while the shared calendar is being fetched', () => {
      MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar.and.returnValue(new Promise(() => {}));

      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('output')?.textContent).toContain('wird geladen');
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar).toHaveBeenCalledWith('shared-token');
    });

    it('shows only the title and countdown before December in Europe/Berlin', async () => {
      MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar.and.resolveTo(createMinAdventSharedCalendarDto());
      fixture.detectChanges();
      await fixture.whenStable();
      component.now.set(Date.UTC(2026, 10, 30, 22, 59, 59));
      fixture.detectChanges();

      expect(component.isBeforeDecember()).toBeTrue();
      expect(component.countdown()).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 1 });
      expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Adventskalender');
      expect(fixture.nativeElement.querySelector('[aria-label="Countdown bis zum 1. Dezember"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ol')).toBeNull();
      expect(fixture.nativeElement.textContent).not.toContain('Alex');
    });

    it('shows all 24 status-only doors from December 1 at midnight in Europe/Berlin', async () => {
      MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar.and.resolveTo(createMinAdventSharedCalendarDto());
      fixture.detectChanges();
      await fixture.whenStable();
      component.now.set(Date.UTC(2026, 10, 30, 23, 0, 0));
      fixture.detectChanges();

      expect(component.isBeforeDecember()).toBeFalse();
      expect(fixture.nativeElement.querySelectorAll('ol li')).toHaveSize(24);
      expect(fixture.nativeElement.textContent).toContain('Befüllt');
      expect(fixture.nativeElement.textContent).toContain('Leer');
      expect(fixture.nativeElement.textContent).not.toContain('Alex');
    });
  });

  describe('loadCalendar()', () => {
    it('shows a neutral message for an unavailable shared token', async () => {
      MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar.and.rejectWith(new HttpErrorResponse({ status: 404 }));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Dieser Adventskalender ist nicht verfügbar.');
      expect(fixture.nativeElement.textContent).not.toContain('Alex');
    });

    it('shows a retryable message for other request errors', async () => {
      MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar.and.rejectWith(new HttpErrorResponse({ status: 500 }));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Der Adventskalender konnte nicht geladen werden.');
      expect(fixture.nativeElement.querySelector('button')?.textContent).toContain('Erneut laden');
    });
  });

  describe('selectDoor()', () => {
    it('opens a filled unlocked door and displays the first-open animation', async () => {
      MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar.and.resolveTo(createMinAdventSharedCalendarDto());
      MINADVENT_CALENDAR_SERVICE_MOCK.openSharedDoor.and.resolveTo({
        day: 1,
        status: 'OPENED',
        version: 2,
        completed: false,
        firstOpened: true,
        blocks: [],
      });
      fixture.detectChanges();
      await fixture.whenStable();
      component.now.set(Date.UTC(2026, 11, 1, 0, 0));

      await component.selectDoor(1);

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.openSharedDoor).toHaveBeenCalledWith('shared-token', 1, 1);
      expect(component.selectedDoor()?.day).toBe(1);
      expect(component.animateDoor()).toBeTrue();
      expect(component.calendar()?.version).toBe(2);
    });

    it('uses a read-only GET to show an already opened door', async () => {
      const calendar = createMinAdventSharedCalendarDto({
        doors: Array.from({ length: 24 }, (_, index) => ({ day: index + 1, status: index === 0 ? 'OPENED' : 'EMPTY' })),
      });
      MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar.and.resolveTo(calendar);
      MINADVENT_CALENDAR_SERVICE_MOCK.getSharedDoor.and.resolveTo({ day: 1, status: 'OPENED', blocks: [] });
      fixture.detectChanges();
      await fixture.whenStable();
      component.now.set(Date.UTC(2026, 11, 1, 0, 0));

      await component.selectDoor(1);

      expect(MINADVENT_CALENDAR_SERVICE_MOCK.getSharedDoor).toHaveBeenCalledWith('shared-token', 1);
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.openSharedDoor).not.toHaveBeenCalled();
      expect(component.animateDoor()).toBeFalse();
    });

    it('requires a confirmed reload after a lost opening response instead of retrying it', async () => {
      MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar.and.resolveTo(createMinAdventSharedCalendarDto());
      MINADVENT_CALENDAR_SERVICE_MOCK.openSharedDoor.and.rejectWith(new HttpErrorResponse({ status: 0 }));
      fixture.detectChanges();
      await fixture.whenStable();
      component.now.set(Date.UTC(2026, 11, 1, 0, 0));

      await component.selectDoor(1);

      expect(component.reloadRequired()).toBeTrue();
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.openSharedDoor).toHaveBeenCalledTimes(1);

      spyOn(window, 'confirm').and.returnValue(true);
      await component.reloadAfterConflict();

      expect(window.confirm).toHaveBeenCalled();
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar).toHaveBeenCalledTimes(2);
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.openSharedDoor).toHaveBeenCalledTimes(1);
    });
  });
});
