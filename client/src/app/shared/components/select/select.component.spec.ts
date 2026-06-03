import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;
  const testOptions = [
    { label: 'Avatar 1', value: 'man-1.svg' },
    { label: 'Avatar 2', value: 'man-2.svg', disabled: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formControlInput', new FormControl(''));
    fixture.componentRef.setInput('id', 'test-select');
    fixture.componentRef.setInput('options', testOptions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selectedOption', () => {
    it('should return matching option when value matches', () => {
      component.formControlInput().setValue('man-1.svg');
      expect(component.selectedOption).toEqual(testOptions[0]);
    });

    it('should return null when no option matches the value', () => {
      component.formControlInput().setValue('unknown.svg');
      expect(component.selectedOption).toBeNull();
    });
  });

  describe('isFormControlInvalid()', () => {
    it('should return true when control is invalid and touched', () => {
      const control = new FormControl('', (c) => (c.value ? null : { required: true }));
      fixture.componentRef.setInput('formControlInput', control);
      control.markAsTouched();
      expect(component.isFormControlInvalid()).toBeTrue();
    });

    it('should return true when control is invalid and dirty', () => {
      const control = new FormControl('', (c) => (c.value ? null : { required: true }));
      fixture.componentRef.setInput('formControlInput', control);
      control.markAsDirty();
      expect(component.isFormControlInvalid()).toBeTrue();
    });

    it('should return false when control is valid', () => {
      const control = new FormControl('man-1.svg');
      fixture.componentRef.setInput('formControlInput', control);
      control.markAsTouched();
      expect(component.isFormControlInvalid()).toBeFalse();
    });
  });

  describe('closeDropdown()', () => {
    it('should set isOpen to false', () => {
      component.isOpen.set(true);
      component.closeDropdown();
      expect(component.isOpen()).toBeFalse();
    });
  });

  describe('getOptionAriaLabel()', () => {
    it('should return label when option has a label', () => {
      expect(component.getOptionAriaLabel({ label: 'My Label', value: 'val' })).toBe('My Label');
    });

    it('should return value when option has no label', () => {
      expect(component.getOptionAriaLabel({ label: '', value: 'my-value' })).toBe('my-value');
    });
  });

  describe('onToggleDropdown()', () => {
    it('should toggle isOpen from false to true', () => {
      component.isOpen.set(false);
      component.onToggleDropdown();
      expect(component.isOpen()).toBeTrue();
    });

    it('should toggle isOpen from true to false', () => {
      component.isOpen.set(true);
      component.onToggleDropdown();
      expect(component.isOpen()).toBeFalse();
    });
  });

  describe('selectOption()', () => {
    it('should set value and close dropdown for a normal option', () => {
      component.isOpen.set(true);
      component.selectOption(testOptions[0]);
      expect(component.formControlInput().value).toBe('man-1.svg');
      expect(component.isOpen()).toBeFalse();
    });

    it('should not change value for a disabled option', () => {
      component.isOpen.set(true);
      component.selectOption(testOptions[1]);
      expect(component.formControlInput().value).toBe('');
      expect(component.isOpen()).toBeTrue();
    });
  });

  describe('onDocumentClick()', () => {
    it('should close dropdown when clicking outside the element', () => {
      component.isOpen.set(true);
      const outsideNode = document.createElement('div');
      document.body.appendChild(outsideNode);
      component.onDocumentClick({ target: outsideNode } as unknown as MouseEvent);
      expect(component.isOpen()).toBeFalse();
      document.body.removeChild(outsideNode);
    });

    it('should not close dropdown when clicking inside the element', () => {
      component.isOpen.set(true);
      component.onDocumentClick({ target: fixture.nativeElement } as unknown as MouseEvent);
      expect(component.isOpen()).toBeTrue();
    });

    it('should not close dropdown when target is not a Node', () => {
      component.isOpen.set(true);
      component.onDocumentClick({ target: null } as unknown as MouseEvent);
      expect(component.isOpen()).toBeTrue();
    });
  });

  describe('onEscapeKey()', () => {
    it('should close dropdown', () => {
      component.isOpen.set(true);
      component.onEscapeKey();
      expect(component.isOpen()).toBeFalse();
    });
  });
});
