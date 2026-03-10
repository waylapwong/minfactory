import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

  describe('inputs', () => {
    it('should have default hasResult as false', () => {
      expect(component.hasResult()).toBe(false);
    });

    it('should accept hasResult input', () => {
      fixture.componentRef.setInput('hasResult', true);
      expect(component.hasResult()).toBe(true);
    });

    it('should have default isDraw as false', () => {
      expect(component.isDraw()).toBe(false);
    });

    it('should accept isDraw input', () => {
      fixture.componentRef.setInput('isDraw', true);
      expect(component.isDraw()).toBe(true);
    });

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

    it('should have default isWinning as false', () => {
      expect(component.isWinning()).toBe(false);
    });

    it('should accept isWinning input', () => {
      fixture.componentRef.setInput('isWinning', true);
      expect(component.isWinning()).toBe(true);
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

    it('should apply bg-green-300 class when hasResult is true and isWinning is true', () => {
      fixture.componentRef.setInput('hasResult', true);
      fixture.componentRef.setInput('isWinning', true);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('bg-green-300')).toBe(true);
    });

    it('should not apply bg-green-300 class when hasResult is false even if isWinning is true', () => {
      fixture.componentRef.setInput('hasResult', false);
      fixture.componentRef.setInput('isWinning', true);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('bg-green-300')).toBe(false);
    });

    it('should apply bg-red-300 class when hasResult is true, isWinning is false, and isDraw is false', () => {
      fixture.componentRef.setInput('hasResult', true);
      fixture.componentRef.setInput('isWinning', false);
      fixture.componentRef.setInput('isDraw', false);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('bg-red-300')).toBe(true);
    });

    it('should apply bg-yellow-300 class when hasResult is true and isDraw is true', () => {
      fixture.componentRef.setInput('hasResult', true);
      fixture.componentRef.setInput('isDraw', true);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('bg-yellow-300')).toBe(true);
    });

    it('should not apply color classes when hasResult is false', () => {
      fixture.componentRef.setInput('hasResult', false);
      fixture.componentRef.setInput('isWinning', false);
      fixture.componentRef.setInput('isDraw', false);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('bg-green-300')).toBe(false);
      expect(button.classList.contains('bg-red-300')).toBe(false);
      expect(button.classList.contains('bg-yellow-300')).toBe(false);
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
