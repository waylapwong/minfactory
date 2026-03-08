import { WritableSignal, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { MinRpsMove, MinRpsResult } from '../../../../core/generated';
import { RoutingService } from '../../../../core/services/routing.service';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRpsMultiplayerViewModel } from '../../models/viewmodels/minrps-multiplayer.viewmodel';
import { MinRpsGameService } from '../../services/minrps-game.service';
import { MinRpsMultiplayerService } from '../../services/minrps-multiplayer.service';
import { MinRpsMultiplayerComponent } from './minrps-multiplayer.component';

describe('MinRpsMultiplayerComponent', () => {
  let component: MinRpsMultiplayerComponent;
  let fixture: ComponentFixture<MinRpsMultiplayerComponent>;
  let mockGameService: jasmine.SpyObj<MinRpsGameService>;
  let mockRoutingService: jasmine.SpyObj<RoutingService>;
  let mockMultiplayerService: jasmine.SpyObj<MinRpsMultiplayerService>;
  let mockGameSignal: WritableSignal<MinRpsMultiplayerViewModel>;

  const createViewModel = (overrides: Partial<MinRpsMultiplayerViewModel> = {}): MinRpsMultiplayerViewModel => {
    const vm = new MinRpsMultiplayerViewModel();
    vm.gameId = 'test-id';
    vm.heroMove = MinRpsMove.None;
    vm.heroName = '';
    vm.isObserver = false;
    vm.canTakeHeroSeat = false;
    vm.canTakeVillainSeat = false;
    vm.result = MinRpsResult.None;
    vm.villainMove = MinRpsMove.None;
    vm.villainName = '';
    Object.assign(vm, overrides);
    return vm;
  };

  beforeEach(async () => {
    mockGameSignal = signal(createViewModel());

    mockGameService = jasmine.createSpyObj('MinRpsGameService', ['gameExistByID'], {
      games: signal([]),
    });
    mockRoutingService = jasmine.createSpyObj('RoutingService', ['navigateToMinRpsOverview']);
    mockMultiplayerService = jasmine.createSpyObj(
      'MinRpsMultiplayerService',
      ['connect', 'disconnect', 'joinGame', 'leaveGame', 'seatGame', 'selectMove', 'setGameId', 'playGame'],
      { game: mockGameSignal },
    );

    const mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ id: 'test-id' }),
      },
      queryParams: of({ id: 'test-id' }),
    };

    mockGameService.gameExistByID.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [MinRpsMultiplayerComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinRpsGameService, useValue: mockGameService },
        { provide: RoutingService, useValue: mockRoutingService },
        { provide: MinRpsMultiplayerService, useValue: mockMultiplayerService },
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
      expect(mockMultiplayerService.setGameId).toHaveBeenCalledWith('test-id');
    });

    it('should connect to multiplayer service', () => {
      expect(mockMultiplayerService.connect).toHaveBeenCalled();
    });

    it('should check if game exists', () => {
      expect(mockGameService.gameExistByID).toHaveBeenCalledWith('test-id');
    });

    it('should navigate away if game does not exist', async () => {
      mockGameService.gameExistByID.and.returnValue(Promise.resolve(false));
      await component['checkGameExists']('non-existent-id');
      expect(mockRoutingService.navigateToMinRpsOverview).toHaveBeenCalled();
    });

    it('should not navigate away if game exists', async () => {
      mockGameService.gameExistByID.and.returnValue(Promise.resolve(true));
      await component['checkGameExists']('test-id');
      expect(mockRoutingService.navigateToMinRpsOverview).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy()', () => {
    it('should call leaveGame on destroy', () => {
      component.ngOnDestroy();
      expect(mockMultiplayerService.leaveGame).toHaveBeenCalled();
    });

    it('should disconnect from multiplayer service', () => {
      component.ngOnDestroy();
      expect(mockMultiplayerService.disconnect).toHaveBeenCalled();
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
      mockGameSignal.set(createViewModel({ isObserver: false }));
      component.playGame();
      expect(mockMultiplayerService.playGame).toHaveBeenCalled();
    });

    it('should not call multiplayerService.playGame when is observer', () => {
      mockGameSignal.set(createViewModel({ isObserver: true }));
      component.playGame();
      expect(mockMultiplayerService.playGame).not.toHaveBeenCalled();
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
      mockGameSignal.set(createViewModel({ canTakeHeroSeat: true }));
      component.openSeatDialog(1);
      expect(component.selectedSeat()).toBe(1);
      expect(component.isSeatDialogOpen()).toBe(true);
    });

    it('should not open dialog for seat 1 when canTakeHeroSeat is false', () => {
      mockGameSignal.set(createViewModel({ canTakeHeroSeat: false }));
      component.isSeatDialogOpen.set(false);
      component.openSeatDialog(1);
      expect(component.isSeatDialogOpen()).toBe(false);
    });

    it('should open dialog for seat 2 when canTakeVillainSeat is true', () => {
      mockGameSignal.set(createViewModel({ canTakeVillainSeat: true }));
      component.openSeatDialog(2);
      expect(component.selectedSeat()).toBe(2);
      expect(component.isSeatDialogOpen()).toBe(true);
    });

    it('should not open dialog for seat 2 when canTakeVillainSeat is false', () => {
      mockGameSignal.set(createViewModel({ canTakeVillainSeat: false }));
      component.isSeatDialogOpen.set(false);
      component.openSeatDialog(2);
      expect(component.isSeatDialogOpen()).toBe(false);
    });

    it('should reset form when opening dialog', () => {
      mockGameSignal.set(createViewModel({ canTakeHeroSeat: true }));
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

  describe('seatGame()', () => {
    it('should call multiplayerService.seatGame when form is valid and seat is selected', () => {
      component.selectedSeat.set(1);
      component.seatFormGroup.patchValue({ name: 'Alice' });

      component.seatGame();

      expect(mockMultiplayerService.seatGame).toHaveBeenCalled();
      expect(component.isSeatDialogOpen()).toBe(false);
    });

    it('should not call multiplayerService.seatGame when form is invalid', () => {
      component.selectedSeat.set(1);
      component.seatFormGroup.patchValue({ name: '' });

      component.seatGame();

      expect(mockMultiplayerService.seatGame).not.toHaveBeenCalled();
    });

    it('should not call multiplayerService.seatGame when no seat selected', () => {
      component.selectedSeat.set(0);
      component.seatFormGroup.patchValue({ name: 'Alice' });

      component.seatGame();

      expect(mockMultiplayerService.seatGame).not.toHaveBeenCalled();
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

      expect(mockMultiplayerService.seatGame).not.toHaveBeenCalled();
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
