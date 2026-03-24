import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Color } from '../../../../shared/enums/color.enum';
import { MinPokerLobbyComponent } from './minpoker-lobby.component';

describe('MinPokerLobbyComponent', () => {
  let component: MinPokerLobbyComponent;
  let fixture: ComponentFixture<MinPokerLobbyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinPokerLobbyComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinPokerLobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have Color enum available', () => {
    expect(component.Color).toBe(Color);
  });

  it('should expose 3 mock games', () => {
    expect(component.games().length).toBe(3);
  });
});
