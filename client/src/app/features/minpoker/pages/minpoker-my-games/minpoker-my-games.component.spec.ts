import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ROUTING_SERVICE_MOCK } from '../../../../core/routing/mocks/routing.service.mock';
import { RoutingService } from '../../../../core/routing/services/routing.service';
import { Color } from '../../../../shared/enums/color.enum';
import { MINPOKER_GAME_SERVICE_MOCK } from '../../mocks/minpoker-game.service.mock';
import { MinPokerGameService } from '../../services/minpoker-game.service';
import { MinPokerMyGamesComponent } from './minpoker-my-games.component';

describe('MinPokerMyGamesComponent', () => {
  let component: MinPokerMyGamesComponent;
  let fixture: ComponentFixture<MinPokerMyGamesComponent>;
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
      imports: [MinPokerMyGamesComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinPokerGameService, useValue: MINPOKER_GAME_SERVICE_MOCK },
        { provide: RoutingService, useValue: ROUTING_SERVICE_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinPokerMyGamesComponent);
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

    component.reloadGames();
    await fixture.whenStable();

    expect(component.isLoading()).toBeFalse();
    expect(component.isError()).toBeTrue();
    expect(component.errorMessage()).toBe('Server down');
  });

  describe('new game dialog and creation', () => {
    it('should open new game dialog and create a game when form valid', async () => {
      component.openNewGameDialog();
      fixture.detectChanges();

      expect(component.isNewGameDialogOpen()).toBeTrue();

      component.newGameName.setValue('Ab');
      expect(component.newGameFormGroup.valid).toBeTrue();

      await component.createGame();

      expect(MINPOKER_GAME_SERVICE_MOCK.createGame).toHaveBeenCalledWith('Ab');
      expect(component.isNewGameDialogOpen()).toBeFalse();
    });

    it('should not create game if form invalid', async () => {
      component.openNewGameDialog();
      fixture.detectChanges();

      component.newGameName.setValue('A'); // too short
      expect(component.newGameFormGroup.invalid).toBeTrue();

      await component.createGame();

      expect(MINPOKER_GAME_SERVICE_MOCK.createGame).not.toHaveBeenCalled();
      expect(component.isNewGameDialogOpen()).toBeTrue();
    });

    it('should show error when createGame rejects', async () => {
      component.openNewGameDialog();
      fixture.detectChanges();

      component.newGameName.setValue('Valid Name');
      MINPOKER_GAME_SERVICE_MOCK.createGame.and.rejectWith(new Error('Create failed'));

      await component.createGame();

      expect(component.isError()).toBeTrue();
      expect(component.errorMessage()).toBe('Create failed');
    });

    it('should show fallback error when createGame rejects with non-error', async () => {
      component.openNewGameDialog();
      fixture.detectChanges();

      component.newGameName.setValue('Valid Name');
      MINPOKER_GAME_SERVICE_MOCK.createGame.and.rejectWith('unexpected');

      await component.createGame();

      expect(component.isError()).toBeTrue();
      expect(component.errorMessage()).toBe('Spiel konnte nicht erstellt werden.');
    });
  });

  it('should show fallback error state when loading games fails with non-error', async () => {
    resolveLoadGames?.();
    await fixture.whenStable();

    MINPOKER_GAME_SERVICE_MOCK.loadGames.and.rejectWith('unexpected');

    component.reloadGames();
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

  describe('delete game dialog', () => {
    beforeEach(() => {
      MINPOKER_GAME_SERVICE_MOCK.deleteGame.calls.reset();
      MINPOKER_GAME_SERVICE_MOCK.deleteGame.and.resolveTo();
    });

    it('should open delete dialog when openDeleteDialog is called', () => {
      const event: MouseEvent = new MouseEvent('click');
      component.openDeleteDialog('game-1', event);

      expect(component.isDeleteDialogOpen()).toBeTrue();
    });

    it('should close delete dialog and clear gameIdToDelete when cancelDeleteGame is called', () => {
      const event: MouseEvent = new MouseEvent('click');
      component.openDeleteDialog('game-1', event);

      component.cancelDeleteGame();

      expect(component.isDeleteDialogOpen()).toBeFalse();
    });

    it('should call deleteGame and close dialog when confirmDeleteGame is called with a valid gameId', async () => {
      const event: MouseEvent = new MouseEvent('click');
      component.openDeleteDialog('game-1', event);

      await component.confirmDeleteGame();

      expect(MINPOKER_GAME_SERVICE_MOCK.deleteGame).toHaveBeenCalledWith('game-1');
      expect(component.isDeleteDialogOpen()).toBeFalse();
    });

    it('should show error when deleteGame rejects with an Error', async () => {
      const event: MouseEvent = new MouseEvent('click');
      component.openDeleteDialog('game-1', event);
      MINPOKER_GAME_SERVICE_MOCK.deleteGame.and.rejectWith(new Error('Delete failed'));

      await component.confirmDeleteGame();

      expect(component.isError()).toBeTrue();
      expect(component.errorMessage()).toBe('Delete failed');
    });

    it('should show fallback error message when deleteGame rejects with non-Error', async () => {
      const event: MouseEvent = new MouseEvent('click');
      component.openDeleteDialog('game-1', event);
      MINPOKER_GAME_SERVICE_MOCK.deleteGame.and.rejectWith('unexpected error');

      await component.confirmDeleteGame();

      expect(component.isError()).toBeTrue();
      expect(component.errorMessage()).toBe('Spiel konnte nicht gelöscht werden.');
    });

    it('should close dialog without calling deleteGame when no gameIdToDelete is set', async () => {
      await component.confirmDeleteGame();

      expect(MINPOKER_GAME_SERVICE_MOCK.deleteGame).not.toHaveBeenCalled();
      expect(component.isDeleteDialogOpen()).toBeFalse();
    });
  });
});
