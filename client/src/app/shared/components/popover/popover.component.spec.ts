import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PopoverComponent } from './popover.component';

describe('PopoverComponent', () => {
  let component: PopoverComponent;
  let fixture: ComponentFixture<PopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopoverComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PopoverComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('content', 'Hilfetext');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open popover on mouseenter', () => {
    component.onMouseEnter();
    fixture.detectChanges();

    const popover: HTMLElement | null = fixture.nativeElement.querySelector('[role="tooltip"]');

    expect(popover).not.toBeNull();
    expect(popover?.textContent?.trim()).toBe('Hilfetext');
  });

  it('should close popover on mouseleave when not pinned', () => {
    component.onMouseEnter();
    component.onMouseLeave();
    fixture.detectChanges();

    const popover: HTMLElement | null = fixture.nativeElement.querySelector('[role="tooltip"]');

    expect(popover).toBeNull();
  });

  it('should toggle pinned state and visibility on click', () => {
    const host: HTMLElement = fixture.debugElement.query(By.css('span.relative')).nativeElement;

    host.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(component.isPinnedByClick()).toBeTrue();
    expect(component.isVisible()).toBeTrue();

    host.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(component.isPinnedByClick()).toBeFalse();
    expect(component.isVisible()).toBeFalse();
  });

  it('should close on escape key', () => {
    component.isPinnedByClick.set(true);
    component.isVisible.set(true);
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(component.isPinnedByClick()).toBeFalse();
    expect(component.isVisible()).toBeFalse();
  });

  it('should close on outside click', () => {
    component.isPinnedByClick.set(true);
    component.isVisible.set(true);
    fixture.detectChanges();

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(component.isPinnedByClick()).toBeFalse();
    expect(component.isVisible()).toBeFalse();
  });

  it('should not open when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    component.onMouseEnter();
    fixture.detectChanges();

    expect(component.isVisible()).toBeFalse();
  });
});
