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
    expect(popover?.classList.contains('opacity-0')).toBeFalse();
    expect(popover?.textContent?.trim()).toBe('Hilfetext');
  });

  it('should close popover on mouseleave when not pinned', () => {
    component.onMouseEnter();
    component.onMouseLeave();
    fixture.detectChanges();

    const popover: HTMLElement | null = fixture.nativeElement.querySelector('[role="tooltip"]');

    expect(popover).not.toBeNull();
    expect(popover?.classList.contains('opacity-0')).toBeTrue();
  });

  it('should toggle pinned state and visibility on click', () => {
    const host: HTMLElement = fixture.debugElement.query(By.css('button.relative')).nativeElement;

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

  it('should keep popover pinned for keyboard activation sequence', () => {
    const host: HTMLElement = fixture.debugElement.query(By.css('button.relative')).nativeElement;

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    host.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(component.isPinnedByClick()).toBeTrue();
    expect(component.isVisible()).toBeTrue();
  });

  describe('onFocusOut()', () => {
    it('should close popover when focus leaves the host element', () => {
      component.isVisible.set(true);
      fixture.detectChanges();

      const focusEvent: FocusEvent = new FocusEvent('focusout', { relatedTarget: document.body });
      component.onFocusOut(focusEvent);
      fixture.detectChanges();

      expect(component.isVisible()).toBeFalse();
    });

    it('should keep popover open when focus moves within the host element', () => {
      component.isVisible.set(true);
      fixture.detectChanges();

      const host: HTMLElement = fixture.nativeElement;
      const innerElement: HTMLElement = host.querySelector('button') as HTMLElement;

      const focusEvent: FocusEvent = new FocusEvent('focusout', { relatedTarget: innerElement });
      component.onFocusOut(focusEvent);
      fixture.detectChanges();

      expect(component.isVisible()).toBeTrue();
    });

    it('should keep popover open when pinned and focus moves outside', () => {
      component.isVisible.set(true);
      component.isPinnedByClick.set(true);
      fixture.detectChanges();

      const focusEvent: FocusEvent = new FocusEvent('focusout', { relatedTarget: document.body });
      component.onFocusOut(focusEvent);
      fixture.detectChanges();

      expect(component.isVisible()).toBeTrue();
    });

    it('should handle null relatedTarget in onFocusOut', () => {
      component.isVisible.set(true);
      fixture.detectChanges();

      const focusEvent: FocusEvent = new FocusEvent('focusout', { relatedTarget: null });
      component.onFocusOut(focusEvent);
      fixture.detectChanges();

      expect(component.isVisible()).toBeFalse();
    });
  });

  describe('onDocumentClick()', () => {
    it('should not close popover when document click target is not a Node', () => {
      component.isVisible.set(true);
      component.isPinnedByClick.set(true);
      fixture.detectChanges();

      const nonNodeEvent: MouseEvent = { target: null } as unknown as MouseEvent;
      component.onDocumentClick(nonNodeEvent);
      fixture.detectChanges();

      expect(component.isVisible()).toBeTrue();
      expect(component.isPinnedByClick()).toBeTrue();
    });

    it('should not close popover when document click is inside host element', () => {
      component.isVisible.set(true);
      component.isPinnedByClick.set(true);
      fixture.detectChanges();

      const host: HTMLElement = fixture.nativeElement;
      const innerElement: HTMLElement = host.querySelector('button') as HTMLElement;

      const insideEvent: MouseEvent = { target: innerElement } as unknown as MouseEvent;
      component.onDocumentClick(insideEvent);
      fixture.detectChanges();

      expect(component.isVisible()).toBeTrue();
    });
  });
});
