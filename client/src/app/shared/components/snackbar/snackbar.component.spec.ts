import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SnackbarComponent } from './snackbar.component';

describe('SnackbarComponent', () => {
  let component: SnackbarComponent;
  let fixture: ComponentFixture<SnackbarComponent>;

  beforeEach(async () => {
    jasmine.clock().install();

    await TestBed.configureTestingModule({
      imports: [SnackbarComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render when closed', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.componentRef.setInput('message', 'Spiel-Link kopiert');
    fixture.detectChanges();

    const snackbar: HTMLOutputElement | null = fixture.nativeElement.querySelector('output');

    expect(snackbar).toBeNull();
  });

  it('should render message when open', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('message', 'Spiel-Link kopiert');
    fixture.detectChanges();

    const snackbar: HTMLOutputElement | null = fixture.nativeElement.querySelector('output');

    expect(snackbar?.textContent?.trim()).toBe('Spiel-Link kopiert');
  });

  it('should emit closed after 3 seconds when open', () => {
    const closedSpy = jasmine.createSpy('closed');
    component.closed.subscribe(closedSpy);

    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('message', 'Spiel-Link kopiert');
    fixture.detectChanges();

    jasmine.clock().tick(2999);
    expect(closedSpy).not.toHaveBeenCalled();

    jasmine.clock().tick(1);
    expect(closedSpy).toHaveBeenCalled();
  });

  it('should emit closed when close button is clicked', () => {
    const closedSpy = jasmine.createSpy('closed');
    component.closed.subscribe(closedSpy);

    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('message', 'Spiel-Link kopiert');
    fixture.detectChanges();

    const closeButton: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      'button[aria-label="Benachrichtigung schliessen"]',
    );

    closeButton?.click();

    expect(closedSpy).toHaveBeenCalled();
  });
});
