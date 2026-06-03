import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { ToggleComponent } from './toggle.component';

describe('ToggleComponent', () => {
  let component: ToggleComponent;
  let fixture: ComponentFixture<ToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formControlInput', new FormControl<boolean>(false));
    fixture.componentRef.setInput('id', 'test-toggle');
    fixture.componentRef.setInput('labelLeft', 'Links');
    fixture.componentRef.setInput('labelRight', 'Rechts');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setValue(false)', () => {
    it('should set the FormControl value to false', () => {
      component.formControlInput().setValue(true);
      component.setValue(false);
      expect(component.formControlInput().value).toBeFalse();
    });

    it('should mark the control as dirty', () => {
      component.setValue(false);
      expect(component.formControlInput().dirty).toBeTrue();
    });

    it('should mark the control as touched', () => {
      component.setValue(false);
      expect(component.formControlInput().touched).toBeTrue();
    });
  });

  describe('setValue(true)', () => {
    it('should set the FormControl value to true', () => {
      component.setValue(true);
      expect(component.formControlInput().value).toBeTrue();
    });

    it('should mark the control as dirty', () => {
      component.setValue(true);
      expect(component.formControlInput().dirty).toBeTrue();
    });

    it('should mark the control as touched', () => {
      component.setValue(true);
      expect(component.formControlInput().touched).toBeTrue();
    });
  });

  describe('setValue() wenn disabled', () => {
    it('should not change the value when the control is disabled', () => {
      const control = new FormControl<boolean>({ value: false, disabled: true });
      fixture.componentRef.setInput('formControlInput', control);
      component.setValue(true);
      expect(component.formControlInput().value).toBeFalse();
    });
  });

  describe('Template: linker Button', () => {
    it('should display the labelLeft text', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons[0].textContent.trim()).toBe('Links');
    });

    it('should have aria-pressed="true" when value is false', () => {
      component.formControlInput().setValue(false);
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    });

    it('should have aria-pressed="false" when value is true', () => {
      fixture.componentRef.setInput('formControlInput', new FormControl<boolean>(true));
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('Template: rechter Button', () => {
    it('should display the labelRight text', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons[1].textContent.trim()).toBe('Rechts');
    });

    it('should have aria-pressed="true" when value is true', () => {
      fixture.componentRef.setInput('formControlInput', new FormControl<boolean>(true));
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    });

    it('should have aria-pressed="false" when value is false', () => {
      component.formControlInput().setValue(false);
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('Template: label', () => {
    it('should display the label when label is set', () => {
      fixture.componentRef.setInput('label', 'Mein Label');
      fixture.detectChanges();
      const labelEl = fixture.nativeElement.querySelector('[id="test-toggle-label"]');
      expect(labelEl).toBeTruthy();
      expect(labelEl.textContent.trim()).toContain('Mein Label');
    });

    it('should not display a label when label is empty', () => {
      fixture.componentRef.setInput('label', '');
      fixture.detectChanges();
      const labelEl = fixture.nativeElement.querySelector('[id="test-toggle-label"]');
      expect(labelEl).toBeNull();
    });
  });

  describe('Template: Klick auf linken Button', () => {
    it('should set the value to false when clicking the left button', () => {
      fixture.componentRef.setInput('formControlInput', new FormControl<boolean>(true));
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      buttons[0].click();
      expect(component.formControlInput().value).toBeFalse();
    });
  });

  describe('Template: Klick auf rechten Button', () => {
    it('should set the value to true when clicking the right button', () => {
      component.formControlInput().setValue(false);
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      buttons[1].click();
      expect(component.formControlInput().value).toBeTrue();
    });
  });
});
