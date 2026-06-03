import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ROUTING_SERVICE_MOCK } from '../../../../core/routing/mocks/routing.service.mock';
import { RoutingService } from '../../../../core/routing/services/routing.service';
import { Color } from '../../../../shared/enums/color.enum';
import { MINPOKER_GAME_SERVICE_MOCK } from '../../mocks/minpoker-game.service.mock';
import { MinPokerGameService } from '../../services/minpoker-game.service';
import { MinPokerPublicGamesComponent } from './minpoker-public-games.component';

describe('MinPokerPublicGamesComponent', () => {
  let component: MinPokerPublicGamesComponent;
  let fixture: ComponentFixture<MinPokerPublicGamesComponent>;
  let resolveLoadGames: (() => void) | null;

  beforeEach(async () => {
    MINPOKER_GAME_SERVICE_MOCK.loadGames.calls.reset();
    MINPOKER_GAME_SERVICE_MOCK.createGame.calls.reset();
    MINPOKER_GAME_SERVICE_MOCK.createGame.and.resolveTo();
    resolveLoadGames = null;
    MINPOKER_GAME_SERVICE_MOCK.loadGames.and.callFake(
      () =>
        new Promise<void>((resolve: () => void) => {
          resolveLoadGames = resolve;
        }),
    );

    await TestBed.configureTestingModule({
      imports: [MinPokerPublicGamesComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinPokerGameService, useValue: MINPOKER_GAME_SERVICE_MOCK },
        { provide: RoutingService, useValue: ROUTING_SERVICE_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinPokerPublicGamesComponent);
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
    expect(component.viewModel).toBe(MINPOKER_GAME_SERVICE_MOCK.publicGamesVm);
  });

  it('should call reloadGames on init', () => {
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

    component.loadGames();
    await fixture.whenStable();

    expect(component.isLoading()).toBeFalse();
    expect(component.isError()).toBeTrue();
    expect(component.errorMessage()).toBe('Server down');
  });

  it('should show fallback error state when loading games fails with non-error', async () => {
    resolveLoadGames?.();
    await fixture.whenStable();

    MINPOKER_GAME_SERVICE_MOCK.loadGames.and.rejectWith('unexpected');

    component.loadGames();
    await fixture.whenStable();

    expect(component.isLoading()).toBeFalse();
    expect(component.isError()).toBeTrue();
    expect(component.errorMessage()).toBe('Spiele konnten nicht geladen werden. Bitte versuche es erneut.');
  });

  describe('navigateToGame()', () => {
    it('should call routingService.navigateToMinPokerGame with the game id', () => {
      ROUTING_SERVICE_MOCK.navigateToMinPokerGame.calls.reset();

      component.navigateToGame('some-game-id');

      expect(ROUTING_SERVICE_MOCK.navigateToMinPokerGame).toHaveBeenCalledWith('some-game-id');
    });
  });
});
