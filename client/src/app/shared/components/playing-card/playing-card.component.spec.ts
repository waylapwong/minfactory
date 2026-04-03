import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayingCardComponent } from './playing-card.component';

describe('PlayingCardComponent', () => {
  let component: PlayingCardComponent;
  let fixture: ComponentFixture<PlayingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayingCardComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayingCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('card', 'Ah');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('isFaceDown()', () => {
    it('should be true when card is "?"', () => {
      fixture.componentRef.setInput('card', '?');
      expect(component.isFaceDown()).toBe(true);
    });

    it('should be false for a real card', () => {
      fixture.componentRef.setInput('card', 'Ah');
      expect(component.isFaceDown()).toBe(false);
    });
  });

  describe('rank()', () => {
    it('should return the rank part of the card', () => {
      fixture.componentRef.setInput('card', 'Ah');
      expect(component.rank()).toBe('A');
    });

    it('should return T for ten of spades', () => {
      fixture.componentRef.setInput('card', 'Ts');
      expect(component.rank()).toBe('T');
    });

    it('should return empty string for face-down card', () => {
      fixture.componentRef.setInput('card', '?');
      expect(component.rank()).toBe('');
    });
  });

  describe('suit()', () => {
    it('should return ♥ for hearts', () => {
      fixture.componentRef.setInput('card', 'Ah');
      expect(component.suit()).toBe('♥');
    });

    it('should return ♦ for diamonds', () => {
      fixture.componentRef.setInput('card', 'Kd');
      expect(component.suit()).toBe('♦');
    });

    it('should return ♠ for spades', () => {
      fixture.componentRef.setInput('card', '2s');
      expect(component.suit()).toBe('♠');
    });

    it('should return ♣ for clubs', () => {
      fixture.componentRef.setInput('card', 'Tc');
      expect(component.suit()).toBe('♣');
    });

    it('should return empty string for face-down card', () => {
      fixture.componentRef.setInput('card', '?');
      expect(component.suit()).toBe('');
    });
  });

  describe('isRed()', () => {
    it('should be true for hearts', () => {
      fixture.componentRef.setInput('card', 'Ah');
      expect(component.isRed()).toBe(true);
    });

    it('should be true for diamonds', () => {
      fixture.componentRef.setInput('card', 'Kd');
      expect(component.isRed()).toBe(true);
    });

    it('should be false for spades', () => {
      fixture.componentRef.setInput('card', '2s');
      expect(component.isRed()).toBe(false);
    });

    it('should be false for clubs', () => {
      fixture.componentRef.setInput('card', 'Tc');
      expect(component.isRed()).toBe(false);
    });
  });
});
