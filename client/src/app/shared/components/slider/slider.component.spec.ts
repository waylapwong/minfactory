import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SliderComponent } from './slider.component';

describe('SliderComponent', () => {
  let component: SliderComponent;
  let fixture: ComponentFixture<SliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliderComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SliderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 100);
    fixture.componentRef.setInput('value', 50);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    it('should bind min, max and value to the native input', () => {
      fixture.componentRef.setInput('min', 10);
      fixture.componentRef.setInput('max', 200);
      fixture.componentRef.setInput('value', 80);
      fixture.componentRef.setInput('step', 5);
      fixture.detectChanges();

      const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="range"]');

      expect(input.min).toBe('10');
      expect(input.max).toBe('200');
      expect(input.step).toBe('5');
    });

    it('should render minLabel when provided', () => {
      fixture.componentRef.setInput('minLabel', 'Min');
      fixture.detectChanges();

      const spans: NodeListOf<HTMLSpanElement> = fixture.nativeElement.querySelectorAll('span');
      const texts = Array.from(spans).map((s) => s.textContent?.trim());

      expect(texts).toContain('Min');
    });

    it('should render maxLabel when provided', () => {
      fixture.componentRef.setInput('maxLabel', 'All-In');
      fixture.detectChanges();

      const spans: NodeListOf<HTMLSpanElement> = fixture.nativeElement.querySelectorAll('span');
      const texts = Array.from(spans).map((s) => s.textContent?.trim());

      expect(texts).toContain('All-In');
    });

    it('should not render label spans when minLabel and maxLabel are not provided', () => {
      const spans: NodeListOf<HTMLSpanElement> = fixture.nativeElement.querySelectorAll('span');

      expect(spans.length).toBe(0);
    });

    it('should render label element when label is provided', () => {
      fixture.componentRef.setInput('label', 'Einsatz');
      fixture.detectChanges();

      const label: HTMLLabelElement | null = fixture.nativeElement.querySelector('label');

      expect(label?.textContent?.trim()).toBe('Einsatz');
    });

    it('should not render label element when label is not provided', () => {
      const label: HTMLLabelElement | null = fixture.nativeElement.querySelector('label');

      expect(label).toBeNull();
    });
  });

  describe('onInput()', () => {
    it('should emit valueChange with the numeric value', () => {
      const spy = jasmine.createSpy('valueChange');
      component.valueChange.subscribe(spy);

      const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="range"]');
      input.value = '75';
      input.dispatchEvent(new Event('input'));

      expect(spy).toHaveBeenCalledWith(75);
    });
  });
});
