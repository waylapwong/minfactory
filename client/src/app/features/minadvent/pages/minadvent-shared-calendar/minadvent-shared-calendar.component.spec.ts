import { HttpErrorResponse } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MinAdventSharedDoorOpenResponseDto } from '../../../../core/generated/model/min-advent-shared-door-open-response-dto';
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
      expect(fixture.nativeElement.querySelectorAll('[aria-label="T\u00fcrchen\u00fcbersicht"] > button')).toHaveSize(
        24,
      );
      expect(fixture.nativeElement.querySelectorAll('min-badge')).toHaveSize(24);
      expect(fixture.nativeElement.querySelector('button[aria-label^="T\u00fcrchen 1"]')?.className).toContain(
        'hover:translate-y-0.5',
      );
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
    it('announces while a door request is pending', async () => {
      MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar.and.resolveTo(createMinAdventSharedCalendarDto());
      let resolveOpening!: (value: MinAdventSharedDoorOpenResponseDto) => void;
      MINADVENT_CALENDAR_SERVICE_MOCK.openSharedDoor.and.returnValue(
        new Promise<MinAdventSharedDoorOpenResponseDto>((resolve) => {
          resolveOpening = resolve;
        }),
      );
      fixture.detectChanges();
      await fixture.whenStable();
      component.now.set(Date.UTC(2026, 11, 1, 0, 0));

      const opening: Promise<void> = component.selectDoor(1);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('output[role="status"][aria-live="polite"]')?.textContent).toContain(
        'Türcheninhalt wird geladen',
      );

      resolveOpening({ day: 1, status: 'OPENED', version: 2, completed: false, firstOpened: true, blocks: [] });
      await opening;
    });

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
      fixture.detectChanges();
      const animatedContent: HTMLElement = fixture.nativeElement.querySelector('.minadvent-first-open') as HTMLElement;
      expect(animatedContent).toBeTruthy();
      expect(getComputedStyle(animatedContent).animationName).toContain('minadvent-door-reveal');
      expect(fixture.nativeElement.querySelector('min-dialog')).toBeTruthy();
    });

    it('uses a read-only GET to show an already opened door', async () => {
      const calendar: import('../../../../core/generated').MinAdventSharedCalendarDto =
        createMinAdventSharedCalendarDto({
          doors: Array.from({ length: 24 }, (_, index) => ({
            day: index + 1,
            status: index === 0 ? 'OPENED' : 'EMPTY',
          })),
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
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.minadvent-first-open')).toBeNull();
    });

    it('shows correctly encoded German error messages when opening a door fails', async () => {
      MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar.and.resolveTo(createMinAdventSharedCalendarDto());
      MINADVENT_CALENDAR_SERVICE_MOCK.openSharedDoor.and.rejectWith(new HttpErrorResponse({ status: 500 }));
      fixture.detectChanges();
      await fixture.whenStable();
      component.now.set(Date.UTC(2026, 11, 1, 0, 0));

      await component.selectDoor(1);

      expect(component.doorError()).toContain('Die Tür konnte nicht geöffnet werden.');
      expect(component.doorError()).not.toContain('TÃ');
    });

    it('opens a reload dialog after a lost opening response instead of retrying it', async () => {
      MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar.and.resolveTo(createMinAdventSharedCalendarDto());
      MINADVENT_CALENDAR_SERVICE_MOCK.openSharedDoor.and.rejectWith(new HttpErrorResponse({ status: 0 }));
      fixture.detectChanges();
      await fixture.whenStable();
      component.now.set(Date.UTC(2026, 11, 1, 0, 0));

      await component.selectDoor(1);

      expect(component.reloadRequired()).toBeTrue();
      expect(component.reloadDialogOpen()).toBeFalse();
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.openSharedDoor).toHaveBeenCalledTimes(1);
      fixture.detectChanges();
      const reloadButton: HTMLButtonElement = Array.from(
        fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
      ).find((button) => button.textContent.trim() === 'Übersicht neu laden') as HTMLButtonElement;
      reloadButton.click();
      fixture.detectChanges();
      expect(component.reloadDialogOpen()).toBeTrue();
      expect(fixture.nativeElement.querySelector('min-dialog')).toBeTruthy();
      expect(fixture.nativeElement.textContent).toContain('Abbrechen');
      expect(fixture.nativeElement.textContent).toContain('Übersicht neu laden');

      const confirmSpy: jasmine.Spy<((message?: string) => boolean) & ((message?: string) => boolean)> = spyOn(
        window,
        'confirm',
      );
      await component.reloadAfterConflict();

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar).toHaveBeenCalledTimes(2);
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.openSharedDoor).toHaveBeenCalledTimes(1);
      expect(component.reloadDialogOpen()).toBeFalse();
    });

    it('closes the reload dialog without discarding the reload action', async () => {
      MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar.and.resolveTo(createMinAdventSharedCalendarDto());
      MINADVENT_CALENDAR_SERVICE_MOCK.openSharedDoor.and.rejectWith(new HttpErrorResponse({ status: 0 }));
      fixture.detectChanges();
      await fixture.whenStable();
      component.now.set(Date.UTC(2026, 11, 1, 0, 0));

      await component.selectDoor(1);
      component.openReloadDialog();
      fixture.detectChanges();
      const cancelButton: HTMLButtonElement = Array.from(
        fixture.nativeElement.querySelectorAll('min-button button') as NodeListOf<HTMLButtonElement>,
      ).find((button) => button.textContent.trim() === 'Abbrechen') as HTMLButtonElement;
      cancelButton.click();

      expect(component.reloadDialogOpen()).toBeFalse();
      expect(component.reloadRequired()).toBeTrue();
      expect(MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar).toHaveBeenCalledTimes(1);
    });

    it('shows the reload dialog after a version conflict', async () => {
      MINADVENT_CALENDAR_SERVICE_MOCK.getSharedCalendar.and.resolveTo(createMinAdventSharedCalendarDto());
      MINADVENT_CALENDAR_SERVICE_MOCK.openSharedDoor.and.rejectWith(new HttpErrorResponse({ status: 409 }));
      fixture.detectChanges();
      await fixture.whenStable();
      component.now.set(Date.UTC(2026, 11, 1, 0, 0));

      await component.selectDoor(1);

      expect(component.reloadRequired()).toBeTrue();
      expect(component.reloadDialogOpen()).toBeTrue();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('min-dialog')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('section[role="alert"]')).toBeNull();
      expect(fixture.nativeElement.textContent).toContain('Abbrechen');
      expect(fixture.nativeElement.textContent).toContain('Übersicht neu laden');
    });
  });
});
