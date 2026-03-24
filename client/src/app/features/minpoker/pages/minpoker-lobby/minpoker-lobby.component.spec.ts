import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ROUTING_SERVICE_MOCK } from '../../../../core/mocks/routing.service.mock';
import { RoutingService } from '../../../../core/routing/routing.service';
import { Color } from '../../../../shared/enums/color.enum';
import { MINPOKER_GAME_SERVICE_MOCK } from '../../mocks/minpoker-game.service.mock';
import { MinPokerGameService } from '../../services/minpoker-game.service';
import { MinPokerLobbyComponent } from './minpoker-lobby.component';

describe('MinPokerLobbyComponent', () => {
  let component: MinPokerLobbyComponent;
  let fixture: ComponentFixture<MinPokerLobbyComponent>;
  let resolveLoadGames: (() => void) | null;

  beforeEach(async () => {
    MINPOKER_GAME_SERVICE_MOCK.loadGames.calls.reset();
    resolveLoadGames = null;
    MINPOKER_GAME_SERVICE_MOCK.loadGames.and.callFake(
      () =>
        new Promise<void>((resolve: () => void) => {
          resolveLoadGames = resolve;
        }),
    );

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
    expect(component.games).toBe(MINPOKER_GAME_SERVICE_MOCK.lobbyViewModels);
  });

  it('should call refreshGames on init', () => {
    expect(MINPOKER_GAME_SERVICE_MOCK.loadGames).toHaveBeenCalled();
  });

  it('should expose loading state while games are loading', () => {
    expect(component.isLoading()).toBeTrue();
  });

  it('should disable loading state after games loaded', async () => {
    resolveLoadGames?.();

    await fixture.whenStable();

    expect(component.isLoading()).toBeFalse();
  });

  it('should expose error state when games loading fails', async () => {
    resolveLoadGames?.();
    await fixture.whenStable();

    MINPOKER_GAME_SERVICE_MOCK.loadGames.and.rejectWith(new Error('Server down'));

    component.reloadGames();
    await fixture.whenStable();

    expect(component.isLoading()).toBeFalse();
    expect(component.isError()).toBeTrue();
    expect(component.errorMessage()).toBe('Server down');
  });
});
