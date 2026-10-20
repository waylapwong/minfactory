import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TextareaComponent } from './textarea.component';

describe('TextareaComponent', () => {
  let component: TextareaComponent;
  let fixture: ComponentFixture<TextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formControlInput', new FormControl(''));
    fixture.componentRef.setInput('id', 'test-textarea');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a character count when enabled', () => {
    fixture.componentRef.setInput('formControlInput', new FormControl('Advent'));
    fixture.componentRef.setInput('maxLength', 20);
    fixture.componentRef.setInput('showCharacterCount', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('6 / 20 Zeichen');
  });

  it('should forward input changes', () => {
    const valueChanged = jasmine.createSpy('valueChanged');
    component.valueChanged.subscribe(valueChanged);
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'Text';
    textarea.dispatchEvent(new Event('input'));

    expect(valueChanged).toHaveBeenCalled();
  });
});
