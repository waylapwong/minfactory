import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinPokerComponent } from './minpoker.component';

describe('MinPokerComponent', () => {
  let component: MinPokerComponent;
  let fixture: ComponentFixture<MinPokerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinPokerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinPokerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
