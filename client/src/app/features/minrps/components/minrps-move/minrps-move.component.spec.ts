import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinRpsResult } from '../../../../core/generated';
import { MinRpsMoveComponent } from './minrps-move.component';

describe('MinRpsMoveComponent', () => {
  let component: MinRpsMoveComponent;
  let fixture: ComponentFixture<MinRpsMoveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRpsMoveComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRpsMoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have MinRpsResult enum available', () => {
    expect(component.MinRpsResult).toBe(MinRpsResult);
  });

  describe('inputs', () => {
    it('should have default isDisabled as false', () => {
      expect(component.isDisabled()).toBe(false);
    });

    it('should accept isDisabled input', () => {
      fixture.componentRef.setInput('isDisabled', true);
      expect(component.isDisabled()).toBe(true);
    });

    it('should have default isPlayed as false', () => {
      expect(component.isPlayed()).toBe(false);
    });

    it('should accept isPlayed input', () => {
      fixture.componentRef.setInput('isPlayed', true);
      expect(component.isPlayed()).toBe(true);
    });

    it('should have default isSelected as false', () => {
      expect(component.isSelected()).toBe(false);
    });

    it('should accept isSelected input', () => {
      fixture.componentRef.setInput('isSelected', true);
      expect(component.isSelected()).toBe(true);
    });

    it('should have default result as None', () => {
      expect(component.result()).toBe(MinRpsResult.None);
    });

    it('should accept result input', () => {
      fixture.componentRef.setInput('result', MinRpsResult.Player1);
      expect(component.result()).toBe(MinRpsResult.Player1);
    });
  });

  describe('selected output', () => {
    it('should emit when button is clicked', () => {
      let emitted = false;
      component.selected.subscribe(() => {
        emitted = true;
      });

      const button = fixture.nativeElement.querySelector('button');
      button.click();

      expect(emitted).toBe(true);
    });
  });

  describe('template rendering', () => {
    it('should apply bg-blue-300 class when isSelected is true', () => {
      fixture.componentRef.setInput('isSelected', true);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('bg-blue-300')).toBe(true);
    });

    it('should apply bg-green-300 class when result is Player1', () => {
      fixture.componentRef.setInput('result', MinRpsResult.Player1);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('bg-green-300')).toBe(true);
    });

    it('should apply bg-red-300 class when result is Player2', () => {
      fixture.componentRef.setInput('result', MinRpsResult.Player2);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('bg-red-300')).toBe(true);
    });

    it('should apply bg-yellow-300 class when result is Draw', () => {
      fixture.componentRef.setInput('result', MinRpsResult.Draw);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('bg-yellow-300')).toBe(true);
    });

    it('should apply -translate-y-2 class when isPlayed is true', () => {
      fixture.componentRef.setInput('isPlayed', true);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('-translate-y-2')).toBe(true);
    });

    it('should disable button when isDisabled is true', () => {
      fixture.componentRef.setInput('isDisabled', true);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.disabled).toBe(true);
    });

    it('should not disable button when isDisabled is false', () => {
      fixture.componentRef.setInput('isDisabled', false);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.disabled).toBe(false);
    });

    it('should have base styling classes', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('rounded-lg')).toBe(true);
      expect(button.classList.contains('border-4')).toBe(true);
      expect(button.classList.contains('border-black')).toBe(true);
      expect(button.classList.contains('px-2')).toBe(true);
      expect(button.classList.contains('py-1')).toBe(true);
      expect(button.classList.contains('shadow-2xl')).toBe(true);
    });
  });
});
