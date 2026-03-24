import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ROUTING_SERVICE_MOCK } from '../../../../core/mocks/routing.service.mock';
import { Color } from '../../../../shared/enums/color.enum';
import { MinPokerGameService } from '../../services/minpoker-game.service';
import { MINPOKER_GAME_SERVICE_MOCK } from '../../mocks/minpoker-game.service.mock';
import { MinPokerLobbyComponent } from './minpoker-lobby.component';

describe('MinPokerLobbyComponent', () => {
  let component: MinPokerLobbyComponent;
  let fixture: ComponentFixture<MinPokerLobbyComponent>;

  beforeEach(async () => {
    MINPOKER_GAME_SERVICE_MOCK.refreshGames.calls.reset();

    await TestBed.configureTestingModule({
      imports: [MinPokerLobbyComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinPokerGameService, useValue: MINPOKER_GAME_SERVICE_MOCK },
        { provide: RoutingService, useValue: ROUTING_SERVICE_MOCK },
      ],
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

  it('should inject game service games signal', () => {
    expect(component.games).toBe(MINPOKER_GAME_SERVICE_MOCK.games);
  });

  it('should call refreshGames on init', () => {
    expect(MINPOKER_GAME_SERVICE_MOCK.refreshGames).toHaveBeenCalled();
  });
});
