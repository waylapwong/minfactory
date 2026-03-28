import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ROUTING_SERVICE_MOCK } from '../../../../core/mocks/routing.service.mock';
import { RoutingService } from '../../../../core/routing/routing.service';
import { Color } from '../../../../shared/enums/color.enum';
import {
  MINPOKER_MULTIPLAYER_GAME_SIGNAL,
  MINPOKER_MULTIPLAYER_PLAYER_ID_SIGNAL,
  MINPOKER_MULTIPLAYER_SERVICE_MOCK,
} from '../../mocks/minpoker-multiplayer.service.mock';
import { MinPokerGameSeatViewModel, MinPokerGameViewModel } from '../../models/viewmodels/minpoker-game.viewmodel';
import { MinPokerMultiplayerService } from '../../services/minpoker-multiplayer.service';
import { MinPokerGameComponent } from './minpoker-game.component';

const ACTIVATED_ROUTE_MOCK = {
  snapshot: { paramMap: { get: jasmine.createSpy('get').and.returnValue('game-id-1') } },
};

describe('MinPokerGameComponent', () => {
  let component: MinPokerGameComponent;
  let fixture: ComponentFixture<MinPokerGameComponent>;

  beforeEach(async () => {
    ACTIVATED_ROUTE_MOCK.snapshot.paramMap.get.calls.reset();
    ACTIVATED_ROUTE_MOCK.snapshot.paramMap.get.and.returnValue('game-id-1');

    MINPOKER_MULTIPLAYER_GAME_SIGNAL.set(new MinPokerGameViewModel());
    MINPOKER_MULTIPLAYER_PLAYER_ID_SIGNAL.set('');

    MINPOKER_MULTIPLAYER_SERVICE_MOCK.connect.calls.reset();
    MINPOKER_MULTIPLAYER_SERVICE_MOCK.disconnect.calls.reset();
    MINPOKER_MULTIPLAYER_SERVICE_MOCK.leaveGame.calls.reset();
    MINPOKER_MULTIPLAYER_SERVICE_MOCK.seatGame.calls.reset();
    MINPOKER_MULTIPLAYER_SERVICE_MOCK.setGameId.calls.reset();

    await TestBed.configureTestingModule({
      imports: [MinPokerGameComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ActivatedRoute, useValue: ACTIVATED_ROUTE_MOCK },
        { provide: MinPokerMultiplayerService, useValue: MINPOKER_MULTIPLAYER_SERVICE_MOCK },
        { provide: RoutingService, useValue: ROUTING_SERVICE_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinPokerGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have Color enum available', () => {
    expect(component.Color).toBe(Color);
  });

  it('should render root layout container in template', () => {
    const rootContainer = fixture.nativeElement.firstElementChild as HTMLElement;

    expect(rootContainer).toBeTruthy();
    expect(rootContainer.classList.contains('flex')).toBe(true);
    expect(rootContainer.classList.contains('h-full')).toBe(true);
    expect(rootContainer.classList.contains('flex-col')).toBe(true);
  });

  it('should render community cards', () => {
    expect(component.communityCards.length).toBe(5);
    expect(component.communityCards).toEqual(['?', '?', '?', '?', '?']);
  });

  it('should render hand cards', () => {
    expect(component.handCards.length).toBe(2);
    expect(component.handCards).toEqual(['?', '?']);
  });

  it('should have initial betAmount of 2', () => {
    expect(component.betAmount()).toBe(2);
  });

  it('should have initial callAmount of 120', () => {
    expect(component.callAmount()).toBe(120);
  });

  it('should have potAmount of 240', () => {
    expect(component.potAmount()).toBe(240);
  });

  it('should update betAmount on onBetChange', () => {
    component.onBetChange(300);

    expect(component.betAmount()).toBe(300);
  });

  it('should expose avatar options with labels and image paths', () => {
    expect(component.avatarOptions.length).toBe(9);
    expect(component.avatarOptions[0]).toEqual(
      jasmine.objectContaining({
        imageSrc: 'assets/svgs/minpoker/avatars/man-1.svg',
        label: 'Man 1',
        value: 'man-1.svg',
      }),
    );
  });

  it('should return avatar asset path', () => {
    expect(component.getAvatarPath('woman-3.svg')).toBe('assets/svgs/minpoker/avatars/woman-3.svg');
  });

  it('should allow calling action handlers without errors', () => {
    expect(() => {
      component.onCall();
      component.onFold();
      component.onRaise();
    }).not.toThrow();
  });

  describe('heroBetAmount', () => {
    it('should have heroBetAmount signal', () => {
      expect(component.heroBetAmount()).toBe(2);
    });

    it('should update heroBetAmount when betAmount changes', () => {
      component.onBetChange(250);

      expect(component.heroBetAmount()).toBe(250);
    });
  });

  describe('ngOnInit()', () => {
    it('should set game id from route params', () => {
      expect(MINPOKER_MULTIPLAYER_SERVICE_MOCK.setGameId).toHaveBeenCalledWith('game-id-1');
    });

    it('should connect the multiplayer service', () => {
      expect(MINPOKER_MULTIPLAYER_SERVICE_MOCK.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('ngOnDestroy()', () => {
    it('should call leaveGame before disconnect', () => {
      const callOrder: string[] = [];
      MINPOKER_MULTIPLAYER_SERVICE_MOCK.leaveGame.and.callFake(() => callOrder.push('leaveGame'));
      MINPOKER_MULTIPLAYER_SERVICE_MOCK.disconnect.and.callFake(() => callOrder.push('disconnect'));

      component.ngOnDestroy();

      expect(callOrder).toEqual(['leaveGame', 'disconnect']);
    });

    it('should disconnect the multiplayer service', () => {
      component.ngOnDestroy();

      expect(MINPOKER_MULTIPLAYER_SERVICE_MOCK.disconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('opponents signal', () => {
    it('should reflect the seats from the multiplayer service game', () => {
      expect(component.opponents()).toBe(MINPOKER_MULTIPLAYER_SERVICE_MOCK.game().seats);
    });
  });

  describe('table perspective', () => {
    it('should show observer top and bottom seat order as 1-2-3 and 6-5-4', () => {
      const vm = new MinPokerGameViewModel();
      vm.isObserver = true;
      vm.seats = new Array(6).fill(null);
      MINPOKER_MULTIPLAYER_GAME_SIGNAL.set(vm);
      fixture.detectChanges();

      expect(component.topSeats().map((seat) => seat.seatIndex)).toEqual([0, 1, 2]);
      expect(component.bottomObserverSeats().map((seat) => seat.seatIndex)).toEqual([5, 4, 3]);
    });

    it('should rotate top seats around hero seat in player view', () => {
      const heroSeat = new MinPokerGameSeatViewModel();
      heroSeat.id = 'hero-id';
      heroSeat.name = 'Hero';
      heroSeat.avatar = 'man-1.svg';
      heroSeat.seat = 3;

      const vm = new MinPokerGameViewModel();
      vm.isObserver = false;
      vm.seats = new Array(6).fill(null);
      vm.seats[3] = heroSeat;
      MINPOKER_MULTIPLAYER_GAME_SIGNAL.set(vm);
      MINPOKER_MULTIPLAYER_PLAYER_ID_SIGNAL.set('hero-id');
      fixture.detectChanges();

      expect(component.topSeats().map((seat) => seat.seatIndex)).toEqual([4, 5, 0, 1, 2]);
    });
  });

  describe('openSeatDialog()', () => {
    it('should open seat dialog for an empty seat', async () => {
      const vm = new MinPokerGameViewModel();
      vm.seats = new Array(6).fill(null);
      MINPOKER_MULTIPLAYER_GAME_SIGNAL.set(vm);
      fixture.detectChanges();

      component.openSeatDialog(2);
      await fixture.whenStable();

      expect(component.isSeatDialogOpen()).toBeTrue();
      expect(component.selectedSeatIndex()).toBe(2);
    });

    it('should not open seat dialog for an occupied seat', async () => {
      const seat = new MinPokerGameSeatViewModel();
      seat.id = 'p1';
      const vm = new MinPokerGameViewModel();
      vm.seats = [seat, null, null, null, null, null];
      MINPOKER_MULTIPLAYER_GAME_SIGNAL.set(vm);
      fixture.detectChanges();

      component.openSeatDialog(0);
      await fixture.whenStable();

      expect(component.isSeatDialogOpen()).toBeFalse();
    });

    it('should not open seat dialog for invalid index', async () => {
      const vm = new MinPokerGameViewModel();
      vm.seats = new Array(6).fill(null);
      MINPOKER_MULTIPLAYER_GAME_SIGNAL.set(vm);
      fixture.detectChanges();

      component.openSeatDialog(-1);
      await fixture.whenStable();
      expect(component.isSeatDialogOpen()).toBeFalse();

      component.openSeatDialog(vm.seats.length);
      await fixture.whenStable();
      expect(component.isSeatDialogOpen()).toBeFalse();
    });

    it('should not open seat dialog when user is not observer', async () => {
      const vm = new MinPokerGameViewModel();
      vm.isObserver = false;
      vm.seats = new Array(6).fill(null);
      MINPOKER_MULTIPLAYER_GAME_SIGNAL.set(vm);
      fixture.detectChanges();

      component.openSeatDialog(2);
      await fixture.whenStable();

      expect(component.isSeatDialogOpen()).toBeFalse();
    });
  });

  describe('closeSeatDialog()', () => {
    it('should close seat dialog and reset selected seat', async () => {
      const vm = new MinPokerGameViewModel();
      vm.seats = new Array(6).fill(null);
      MINPOKER_MULTIPLAYER_GAME_SIGNAL.set(vm);
      fixture.detectChanges();
      component.openSeatDialog(3);
      await fixture.whenStable();

      component.closeSeatDialog();

      expect(component.isSeatDialogOpen()).toBeFalse();
      expect(component.selectedSeatIndex()).toBe(-1);
    });
  });

  describe('seatGame()', () => {
    beforeEach(async () => {
      const vm = new MinPokerGameViewModel();
      vm.seats = new Array(6).fill(null);
      MINPOKER_MULTIPLAYER_GAME_SIGNAL.set(vm);
      fixture.detectChanges();
      component.openSeatDialog(2);
      await fixture.whenStable();
    });

    it('should call multiplayerService.seatGame with correct arguments', () => {
      component.seatName.setValue('Chris');
      component.seatAvatar.setValue('man-4.svg');

      component.seatGame();

      expect(MINPOKER_MULTIPLAYER_SERVICE_MOCK.seatGame).toHaveBeenCalledWith('Chris', 'man-4.svg', 2);
    });

    it('should close the seat dialog after seating', () => {
      component.seatName.setValue('Chris');
      component.seatAvatar.setValue('man-4.svg');

      component.seatGame();

      expect(component.isSeatDialogOpen()).toBeFalse();
    });

    it('should not call seatGame when form is invalid', () => {
      component.seatGame();

      expect(MINPOKER_MULTIPLAYER_SERVICE_MOCK.seatGame).not.toHaveBeenCalled();
      expect(component.isSeatDialogOpen()).toBeTrue();
    });

    it('should not call seatGame when no seat is selected', () => {
      component.closeSeatDialog();
      component.seatName.setValue('Chris');
      component.seatAvatar.setValue('man-4.svg');

      component.seatGame();

      expect(MINPOKER_MULTIPLAYER_SERVICE_MOCK.seatGame).not.toHaveBeenCalled();
    });

    it('should not call seatGame when trimmed name is empty', () => {
      component.seatName.setValue('   ');
      component.seatAvatar.setValue('man-4.svg');

      component.seatGame();

      expect(MINPOKER_MULTIPLAYER_SERVICE_MOCK.seatGame).not.toHaveBeenCalled();
      expect(component.isSeatDialogOpen()).toBeTrue();
    });
  });

  describe('Leave Game Dialog', () => {
    it('should initialize with isLeaveDialogOpen closed', () => {
      expect(component.isLeaveDialogOpen()).toBe(false);
    });

    it('should open leave dialog on canDeactivate()', () => {
      void component.canDeactivate();

      expect(component.isLeaveDialogOpen()).toBeTrue();
    });

    it('should close an open seat dialog when canDeactivate is called', async () => {
      const vm = new MinPokerGameViewModel();
      vm.seats = new Array(6).fill(null);
      MINPOKER_MULTIPLAYER_GAME_SIGNAL.set(vm);
      fixture.detectChanges();
      component.openSeatDialog(4);
      await fixture.whenStable();

      void component.canDeactivate();

      expect(component.isSeatDialogOpen()).toBeFalse();
      expect(component.selectedSeatIndex()).toBe(-1);
    });

    it('should close leave dialog on cancelLeave()', () => {
      component.isLeaveDialogOpen.set(true);
      component.cancelLeave();

      expect(component.isLeaveDialogOpen()).toBe(false);
    });

    it('should resolve canDeactivate with true on confirmLeave()', async () => {
      const promise = component.canDeactivate();
      component.confirmLeave();

      await expectAsync(promise).toBeResolvedTo(true);
      expect(component.isLeaveDialogOpen()).toBe(false);
    });

    it('should resolve canDeactivate with false on cancelLeave()', async () => {
      const promise = component.canDeactivate();
      component.cancelLeave();

      await expectAsync(promise).toBeResolvedTo(false);
      expect(component.isLeaveDialogOpen()).toBe(false);
    });

    it('should resolve pending canDeactivate with false on destroy', async () => {
      const promise = component.canDeactivate();

      component.ngOnDestroy();

      await expectAsync(promise).toBeResolvedTo(false);
    });

    it('should resolve a previous pending canDeactivate with false before opening a new one', async () => {
      const firstPromise = component.canDeactivate();
      const secondPromise = component.canDeactivate();

      await expectAsync(firstPromise).toBeResolvedTo(false);

      component.confirmLeave();

      await expectAsync(secondPromise).toBeResolvedTo(true);
    });
  });

  describe('shareGameUrl()', () => {
    it('should call clipboard API', async () => {
      const clipboardSpy = jasmine.createSpy('writeText').and.resolveTo();
      const originalClipboard = navigator.clipboard;

      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: clipboardSpy },
      });

      component.shareGameUrl();
      await Promise.resolve();

      expect(clipboardSpy).toHaveBeenCalledWith(globalThis.location.href);

      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: originalClipboard,
      });
    });
  });
});
