import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinRpsResult } from '../../../../core/generated';
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

  it('should have MinRpsResult enum available', () => {
    expect(component.MinRpsResult).toBe(MinRpsResult);
  });

  describe('result input', () => {
    it('should have default value of None', () => {
      expect(component.result()).toBe(MinRpsResult.None);
    });

    it('should accept Player1 result', () => {
      fixture.componentRef.setInput('result', MinRpsResult.Player1);
      expect(component.result()).toBe(MinRpsResult.Player1);
    });

    it('should accept Player2 result', () => {
      fixture.componentRef.setInput('result', MinRpsResult.Player2);
      expect(component.result()).toBe(MinRpsResult.Player2);
    });

    it('should accept Draw result', () => {
      fixture.componentRef.setInput('result', MinRpsResult.Draw);
      expect(component.result()).toBe(MinRpsResult.Draw);
    });
  });

  describe('template rendering', () => {
    it('should apply bg-green-300 class when result is Player2', () => {
      fixture.componentRef.setInput('result', MinRpsResult.Player2);
      fixture.detectChanges();
      const element = fixture.nativeElement.querySelector('div');
      expect(element.classList.contains('bg-green-300')).toBe(true);
      expect(element.classList.contains('bg-red-300')).toBe(false);
      expect(element.classList.contains('bg-yellow-300')).toBe(false);
    });

    it('should apply bg-red-300 class when result is Player1', () => {
      fixture.componentRef.setInput('result', MinRpsResult.Player1);
      fixture.detectChanges();
      const element = fixture.nativeElement.querySelector('div');
      expect(element.classList.contains('bg-red-300')).toBe(true);
      expect(element.classList.contains('bg-green-300')).toBe(false);
      expect(element.classList.contains('bg-yellow-300')).toBe(false);
    });

    it('should apply bg-yellow-300 class when result is Draw', () => {
      fixture.componentRef.setInput('result', MinRpsResult.Draw);
      fixture.detectChanges();
      const element = fixture.nativeElement.querySelector('div');
      expect(element.classList.contains('bg-yellow-300')).toBe(true);
      expect(element.classList.contains('bg-red-300')).toBe(false);
      expect(element.classList.contains('bg-green-300')).toBe(false);
    });

    it('should not apply color classes when result is None', () => {
      fixture.componentRef.setInput('result', MinRpsResult.None);
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
