import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Color } from '../../enums/color.enum';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('cssClass()', () => {
    it('should return correct css class for color blue', () => {
      fixture.componentRef.setInput('color', Color.Blue);
      const cssClass: string = component.cssClass();
      expect(cssClass).toContain('bg-blue-300');
    });

    it('should return correct css class for color red', () => {
      fixture.componentRef.setInput('color', Color.Red);
      const cssClass: string = component.cssClass();
      expect(cssClass).toContain('bg-red-300');
    });

    it('should return correct css class for color green', () => {
      fixture.componentRef.setInput('color', Color.Green);
      const cssClass: string = component.cssClass();
      expect(cssClass).toContain('bg-green-300');
    });

    it('should return correct css class for color yellow', () => {
      fixture.componentRef.setInput('color', Color.Yellow);
      const cssClass: string = component.cssClass();
      expect(cssClass).toContain('bg-yellow-300');
    });

    it('should return correct css class for color gray', () => {
      fixture.componentRef.setInput('color', Color.Gray);
      const cssClass: string = component.cssClass();
      expect(cssClass).toContain('bg-gray-300');
    });
  });
});
