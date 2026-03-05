import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinRpsCardComponent } from './minrps-card.component';

describe('MinRpsCardComponent', () => {
  let component: MinRpsCardComponent;
  let fixture: ComponentFixture<MinRpsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRpsCardComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRpsCardComponent);
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

    it('should have default isWinning as false', () => {
      expect(component.isWinning()).toBe(false);
    });

    it('should accept isWinning input', () => {
      fixture.componentRef.setInput('isWinning', true);
      expect(component.isWinning()).toBe(true);
    });
  });

  describe('template rendering', () => {
    it('should apply bg-green-300 class when hasResult is true and isWinning is true', () => {
      fixture.componentRef.setInput('hasResult', true);
      fixture.componentRef.setInput('isWinning', true);
      fixture.detectChanges();
      const element = fixture.nativeElement.querySelector('div');
      expect(element.classList.contains('bg-green-300')).toBe(true);
    });

    it('should apply bg-red-300 class when hasResult is true, isWinning is false, and isDraw is false', () => {
      fixture.componentRef.setInput('hasResult', true);
      fixture.componentRef.setInput('isWinning', false);
      fixture.componentRef.setInput('isDraw', false);
      fixture.detectChanges();
      const element = fixture.nativeElement.querySelector('div');
      expect(element.classList.contains('bg-red-300')).toBe(true);
      expect(element.classList.contains('bg-green-300')).toBe(false);
      expect(element.classList.contains('bg-yellow-300')).toBe(false);
    });

    it('should apply bg-yellow-300 class when hasResult is true and isDraw is true', () => {
      fixture.componentRef.setInput('hasResult', true);
      fixture.componentRef.setInput('isDraw', true);
      fixture.detectChanges();
      const element = fixture.nativeElement.querySelector('div');
      expect(element.classList.contains('bg-yellow-300')).toBe(true);
      expect(element.classList.contains('bg-red-300')).toBe(false);
      expect(element.classList.contains('bg-green-300')).toBe(false);
    });

    it('should not apply color classes when hasResult is false', () => {
      fixture.componentRef.setInput('hasResult', false);
      fixture.componentRef.setInput('isWinning', false);
      fixture.componentRef.setInput('isDraw', false);
      fixture.detectChanges();
      const element = fixture.nativeElement.querySelector('div');
      expect(element.classList.contains('bg-green-300')).toBe(false);
      expect(element.classList.contains('bg-red-300')).toBe(false);
      expect(element.classList.contains('bg-yellow-300')).toBe(false);
    });

    it('should have base styling classes', () => {
      const element = fixture.nativeElement.querySelector('div');
      expect(element.classList.contains('rounded-lg')).toBe(true);
      expect(element.classList.contains('border-4')).toBe(true);
      expect(element.classList.contains('border-black')).toBe(true);
      expect(element.classList.contains('px-2')).toBe(true);
      expect(element.classList.contains('py-1')).toBe(true);
      expect(element.classList.contains('shadow-2xl')).toBe(true);
    });
  });
});
