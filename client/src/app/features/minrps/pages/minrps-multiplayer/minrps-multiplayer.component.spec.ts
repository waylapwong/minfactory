import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { MinRpsMove, MinRpsResult } from '../../../../core/generated';
import { RoutingService } from '../../../../core/routing/routing.service';
import { ROUTING_SERVICE_MOCK } from '../../../../core/mocks/routing.service.mock';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRpsMultiplayerViewModel } from '../../models/viewmodels/minrps-multiplayer.viewmodel';
import { MinRpsGameService } from '../../services/minrps-game.service';
import { MINRPS_GAME_SERVICE_MOCK } from '../../mocks/minrps-game.service.mock';
import { MinRpsMultiplayerService } from '../../services/minrps-multiplayer.service';
import { MINRPS_MULTIPLAYER_SERVICE_MOCK } from '../../mocks/minrps-multiplayer.service.mock';
import { MinRpsMultiplayerComponent } from './minrps-multiplayer.component';

describe('MinRpsMultiplayerComponent', () => {
  let component: MinRpsMultiplayerComponent;
  let fixture: ComponentFixture<MinRpsMultiplayerComponent>;
  let clipboardWriteTextSpy: jasmine.Spy;

  const createViewModel = (overrides: Partial<MinRpsMultiplayerViewModel> = {}): MinRpsMultiplayerViewModel => {
    const vm = new MinRpsMultiplayerViewModel();
    vm.gameId = 'test-id';
    vm.heroMove = MinRpsMove.None;
    vm.heroName = '';
    vm.isObserver = false;
    vm.canTakeHeroSeat = false;
    vm.canTakeVillainSeat = false;
    vm.resultHistory = [];
    vm.result = MinRpsResult.None;
    vm.villainMove = MinRpsMove.None;
    vm.villainName = '';
    Object.assign(vm, overrides);
    return vm;
  };

  beforeEach(async () => {
    clipboardWriteTextSpy = jasmine.createSpy('writeText').and.returnValue(Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: clipboardWriteTextSpy,
      },
    });

    MINRPS_GAME_SERVICE_MOCK.gameExistByID.calls.reset();
    ROUTING_SERVICE_MOCK.navigateToMinRpsOverview.calls.reset();
    MINRPS_MULTIPLAYER_SERVICE_MOCK.game.set(createViewModel());
    MINRPS_MULTIPLAYER_SERVICE_MOCK.connect.calls.reset();
    MINRPS_MULTIPLAYER_SERVICE_MOCK.disconnect.calls.reset();
    MINRPS_MULTIPLAYER_SERVICE_MOCK.joinGame.calls.reset();
    MINRPS_MULTIPLAYER_SERVICE_MOCK.leaveGame.calls.reset();
    MINRPS_MULTIPLAYER_SERVICE_MOCK.seatGame.calls.reset();
    MINRPS_MULTIPLAYER_SERVICE_MOCK.selectMove.calls.reset();
    MINRPS_MULTIPLAYER_SERVICE_MOCK.setGameId.calls.reset();
    MINRPS_MULTIPLAYER_SERVICE_MOCK.playGame.calls.reset();

    const mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ id: 'test-id' }),
      },
      queryParams: of({ id: 'test-id' }),
    };

    MINRPS_GAME_SERVICE_MOCK.gameExistByID.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [MinRpsMultiplayerComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinRpsGameService, useValue: MINRPS_GAME_SERVICE_MOCK },
        { provide: RoutingService, useValue: ROUTING_SERVICE_MOCK },
        { provide: MinRpsMultiplayerService, useValue: MINRPS_MULTIPLAYER_SERVICE_MOCK },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRpsMultiplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have Color enum available', () => {
    expect(component.Color).toBe(Color);
  });

  it('should have MinRpsMove enum available', () => {
    expect(component.MinRpsMove).toBe(MinRpsMove);
  });

  it('should have selectable moves array', () => {
    expect(component.SELECTABLE_MOVES).toEqual([MinRpsMove.Rock, MinRpsMove.Paper, MinRpsMove.Scissors]);
  });

  describe('ngOnInit()', () => {
    it('should call setGameId with route id', () => {
      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.setGameId).toHaveBeenCalledWith('test-id');
    });

    it('should connect to multiplayer service', () => {
      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.connect).toHaveBeenCalled();
    });

    it('should check if game exists', () => {
      expect(MINRPS_GAME_SERVICE_MOCK.gameExistByID).toHaveBeenCalledWith('test-id');
    });

    it('should navigate away if game does not exist', async () => {
      MINRPS_GAME_SERVICE_MOCK.gameExistByID.and.returnValue(Promise.resolve(false));
      await component['checkGameExists']('non-existent-id');
      expect(ROUTING_SERVICE_MOCK.navigateToMinRpsOverview).toHaveBeenCalled();
    });

    it('should not navigate away if game exists', async () => {
      MINRPS_GAME_SERVICE_MOCK.gameExistByID.and.returnValue(Promise.resolve(true));
      await component['checkGameExists']('test-id');
      expect(ROUTING_SERVICE_MOCK.navigateToMinRpsOverview).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy()', () => {
    it('should call leaveGame on destroy', () => {
      component.ngOnDestroy();
      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.leaveGame).toHaveBeenCalled();
    });

    it('should disconnect from multiplayer service', () => {
      component.ngOnDestroy();
      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.disconnect).toHaveBeenCalled();
    });

    it('should resolve any pending canDeactivate promise with false', async () => {
      const promise = component.canDeactivate();
      component.ngOnDestroy();
      await expectAsync(promise).toBeResolvedTo(false);
    });
  });

  describe('submitText computed signal', () => {
    it('should return "Wähle einen Zug" when no move selected', () => {
      component.selectedMove.set(MinRpsMove.None);
      expect(component.submitText()).toBe('Wähle einen Zug');
    });

    it('should return "Spiele Stein!" when rock is selected', () => {
      component.selectedMove.set(MinRpsMove.Rock);
      expect(component.submitText()).toBe('Spiele Stein!');
    });

    it('should return "Spiele Papier!" when paper is selected', () => {
      component.selectedMove.set(MinRpsMove.Paper);
      expect(component.submitText()).toBe('Spiele Papier!');
    });

    it('should return "Spiele Schere!" when scissors is selected', () => {
      component.selectedMove.set(MinRpsMove.Scissors);
      expect(component.submitText()).toBe('Spiele Schere!');
    });

    it('should return empty string for unknown move', () => {
      component.selectedMove.set('unknown' as MinRpsMove);
      expect(component.submitText()).toBe('');
    });
  });

  describe('playGame()', () => {
    it('should call multiplayerService.playGame when not observer', () => {
      MINRPS_MULTIPLAYER_SERVICE_MOCK.game.set(createViewModel({ isObserver: false }));
      component.playGame();
      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.playGame).toHaveBeenCalled();
    });

    it('should not call multiplayerService.playGame when is observer', () => {
      MINRPS_MULTIPLAYER_SERVICE_MOCK.game.set(createViewModel({ isObserver: true }));
      component.playGame();
      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.playGame).not.toHaveBeenCalled();
    });
  });

  describe('result history', () => {
    it('should render history entries in player view', () => {
      MINRPS_MULTIPLAYER_SERVICE_MOCK.game.set(
        createViewModel({ isObserver: false, resultHistory: [MinRpsResult.Player1, MinRpsResult.Draw] }),
      );
      fixture.detectChanges();

      const historyItems: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll(
        '[data-testid="result-history-item"]',
      );

      expect(historyItems.length).toBe(2);
    });
  });

  describe('shareGameUrl()', () => {
    it('should copy the current browser url to the clipboard', () => {
      component.shareGameUrl();

      expect(clipboardWriteTextSpy).toHaveBeenCalledWith(globalThis.location.href);
    });

    it('should open the share snackbar', () => {
      component.shareGameUrl();

      expect(component.isShareSnackbarOpen()).toBe(true);
    });
  });

  describe('closeShareSnackbar()', () => {
    it('should close the share snackbar', () => {
      component.isShareSnackbarOpen.set(true);

      component.closeShareSnackbar();

      expect(component.isShareSnackbarOpen()).toBe(false);
    });
  });

  describe('selectMove()', () => {
    it('should set selectedMove to Rock', () => {
      component.selectMove(MinRpsMove.Rock);
      expect(component.selectedMove()).toBe(MinRpsMove.Rock);
    });

    it('should set selectedMove to Paper', () => {
      component.selectMove(MinRpsMove.Paper);
      expect(component.selectedMove()).toBe(MinRpsMove.Paper);
    });

    it('should set selectedMove to Scissors', () => {
      component.selectMove(MinRpsMove.Scissors);
      expect(component.selectedMove()).toBe(MinRpsMove.Scissors);
    });
  });

  describe('seatName getter', () => {
    it('should return the name form control', () => {
      const control = component.seatName;
      expect(control).toBeTruthy();
      expect(control.value).toBe('');
    });
  });

  describe('openSeatDialog()', () => {
    it('should open dialog for seat 1 when canTakeHeroSeat is true', () => {
      MINRPS_MULTIPLAYER_SERVICE_MOCK.game.set(createViewModel({ canTakeHeroSeat: true }));
      component.openSeatDialog(1);
      expect(component.selectedSeat()).toBe(1);
      expect(component.isSeatDialogOpen()).toBe(true);
    });

    it('should not open dialog for seat 1 when canTakeHeroSeat is false', () => {
      MINRPS_MULTIPLAYER_SERVICE_MOCK.game.set(createViewModel({ canTakeHeroSeat: false }));
      component.isSeatDialogOpen.set(false);
      component.openSeatDialog(1);
      expect(component.isSeatDialogOpen()).toBe(false);
    });

    it('should open dialog for seat 2 when canTakeVillainSeat is true', () => {
      MINRPS_MULTIPLAYER_SERVICE_MOCK.game.set(createViewModel({ canTakeVillainSeat: true }));
      component.openSeatDialog(2);
      expect(component.selectedSeat()).toBe(2);
      expect(component.isSeatDialogOpen()).toBe(true);
    });

    it('should not open dialog for seat 2 when canTakeVillainSeat is false', () => {
      MINRPS_MULTIPLAYER_SERVICE_MOCK.game.set(createViewModel({ canTakeVillainSeat: false }));
      component.isSeatDialogOpen.set(false);
      component.openSeatDialog(2);
      expect(component.isSeatDialogOpen()).toBe(false);
    });

    it('should reset form when opening dialog', () => {
      MINRPS_MULTIPLAYER_SERVICE_MOCK.game.set(createViewModel({ canTakeHeroSeat: true }));
      component.seatFormGroup.patchValue({ name: 'Old Name' });
      component.openSeatDialog(1);
      expect(component.seatName.value).toBe('');
    });
  });

  describe('closeSeatDialog()', () => {
    it('should close the seat dialog', () => {
      component.isSeatDialogOpen.set(true);
      component.closeSeatDialog();
      expect(component.isSeatDialogOpen()).toBe(false);
    });
  });

  describe('canDeactivate()', () => {
    it('should open the leave dialog', () => {
      component.isLeaveDialogOpen.set(false);
      component.canDeactivate();
      expect(component.isLeaveDialogOpen()).toBe(true);
    });

    it('should return a Promise', () => {
      const result = component.canDeactivate();
      expect(result).toBeInstanceOf(Promise);
    });

    it('should resolve previous pending promise with false when called again', async () => {
      const firstPromise = component.canDeactivate();
      component.canDeactivate();
      await expectAsync(firstPromise).toBeResolvedTo(false);
    });

    it('should resolve immediately with true when game is non-existent', async () => {
      MINRPS_GAME_SERVICE_MOCK.gameExistByID.and.returnValue(Promise.resolve(false));
      await component['checkGameExists']('non-existent-id');
      const result = component.canDeactivate();
      await expectAsync(result).toBeResolvedTo(true);
      expect(component.isLeaveDialogOpen()).toBe(false);
    });
  });

  describe('confirmLeave()', () => {
    it('should close the leave dialog', () => {
      component.isLeaveDialogOpen.set(true);
      component.canDeactivate();
      component.confirmLeave();
      expect(component.isLeaveDialogOpen()).toBe(false);
    });

    it('should resolve canDeactivate promise with true', async () => {
      const promise = component.canDeactivate();
      component.confirmLeave();
      await expectAsync(promise).toBeResolvedTo(true);
    });
  });

  describe('cancelLeave()', () => {
    it('should close the leave dialog', () => {
      component.isLeaveDialogOpen.set(true);
      component.canDeactivate();
      component.cancelLeave();
      expect(component.isLeaveDialogOpen()).toBe(false);
    });

    it('should resolve canDeactivate promise with false', async () => {
      const promise = component.canDeactivate();
      component.cancelLeave();
      await expectAsync(promise).toBeResolvedTo(false);
    });
  });

  describe('seatGame()', () => {
    it('should call multiplayerService.seatGame when form is valid and seat is selected', () => {
      component.selectedSeat.set(1);
      component.seatFormGroup.patchValue({ name: 'Alice' });

      component.seatGame();

      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.seatGame).toHaveBeenCalled();
      expect(component.isSeatDialogOpen()).toBe(false);
    });

    it('should not call multiplayerService.seatGame when form is invalid', () => {
      component.selectedSeat.set(1);
      component.seatFormGroup.patchValue({ name: '' });

      component.seatGame();

      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.seatGame).not.toHaveBeenCalled();
    });

    it('should not call multiplayerService.seatGame when no seat selected', () => {
      component.selectedSeat.set(0);
      component.seatFormGroup.patchValue({ name: 'Alice' });

      component.seatGame();

      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.seatGame).not.toHaveBeenCalled();
    });

    it('should reset selectedSeat to 0 after success', () => {
      component.selectedSeat.set(1);
      component.seatFormGroup.patchValue({ name: 'Alice' });

      component.seatGame();

      expect(component.selectedSeat()).toBe(0);
    });

    it('should not call multiplayerService.seatGame when name is only whitespace', () => {
      component.selectedSeat.set(1);
      component.seatFormGroup.patchValue({ name: '   ' });

      component.seatGame();

      expect(MINRPS_MULTIPLAYER_SERVICE_MOCK.seatGame).not.toHaveBeenCalled();
    });
  });

  describe('form validation', () => {
    it('should require name field', () => {
      const control = component.seatName;
      control.setValue('');
      expect(control.hasError('required')).toBe(true);
    });

    it('should enforce maximum length of 16', () => {
      const control = component.seatName;
      control.setValue('A'.repeat(17));
      expect(control.hasError('maxlength')).toBe(true);
    });

    it('should be valid with proper length', () => {
      const control = component.seatName;
      control.setValue('Alice');
      expect(control.valid).toBe(true);
    });
  });
});
