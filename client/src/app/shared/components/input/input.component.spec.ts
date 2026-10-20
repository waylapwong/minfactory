import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formControlInput', new FormControl());
    fixture.componentRef.setInput('id', 'test-input');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should bind min and max attributes', () => {
    fixture.componentRef.setInput('min', 1);
    fixture.componentRef.setInput('max', 9999);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.min).toBe('1');
    expect(input.max).toBe('9999');
  });

  it('should show the current character count when enabled', () => {
    fixture.componentRef.setInput('formControlInput', new FormControl('Advent'));
    fixture.componentRef.setInput('maxLength', 20);
    fixture.componentRef.setInput('showCharacterCount', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('6 / 20 Zeichen');
  });

  it('should forward input changes', () => {
    const valueChanged = jasmine.createSpy('valueChanged');
    component.valueChanged.subscribe(valueChanged);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Test';
    input.dispatchEvent(new Event('input'));

    expect(valueChanged).toHaveBeenCalled();
  });
});
