import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ROUTING_SERVICE_MOCK } from '../../../../core/mocks/routing.service.mock';
import { RoutingService } from '../../../../core/routing/routing.service';
import { Color } from '../../../../shared/enums/color.enum';
import { MinPokerGameComponent } from './minpoker-game.component';

describe('MinPokerGameComponent', () => {
  let component: MinPokerGameComponent;
  let fixture: ComponentFixture<MinPokerGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinPokerGameComponent],
      providers: [provideZonelessChangeDetection(), { provide: RoutingService, useValue: ROUTING_SERVICE_MOCK }],
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

  it('should have 6 opponents', () => {
    expect(component.opponents.length).toBe(6);
  });

  it('should include bet amounts for opponents with actions', () => {
    expect(component.opponents[0]).toEqual(
      jasmine.objectContaining({ name: 'Alex', lastAction: 'Call', betAmount: 40 }),
    );
    expect(component.opponents[1]).toEqual(
      jasmine.objectContaining({ name: 'Mia', lastAction: 'Raise', betAmount: 120 }),
    );
    expect(component.opponents[4]).toBeNull();
  });

  it('should open seat dialog only for empty seats', () => {
    component.openSeatDialog(4);
    expect(component.isSeatDialogOpen()).toBe(true);
    expect(component.selectedSeatIndex()).toBe(4);

    component.closeSeatDialog();
    component.openSeatDialog(0);
    expect(component.isSeatDialogOpen()).toBe(false);
  });

  it('should ignore invalid seat indexes when opening seat dialog', () => {
    component.openSeatDialog(-1);
    expect(component.isSeatDialogOpen()).toBeFalse();
    expect(component.selectedSeatIndex()).toBe(-1);

    component.openSeatDialog(component.opponents.length);
    expect(component.isSeatDialogOpen()).toBeFalse();
    expect(component.selectedSeatIndex()).toBe(-1);
  });

  it('should seat player on empty position', () => {
    component.openSeatDialog(4);
    component.seatName.setValue('Chris');
    component.seatAvatar.setValue('man-4.svg');

    component.seatGame();

    expect(component.opponents[4]).toEqual(
      jasmine.objectContaining({ name: 'Chris', avatar: 'man-4.svg', chips: 1000, lastAction: 'Sitzt' }),
    );
    expect(component.isSeatDialogOpen()).toBe(false);
  });

  it('should not seat player when form is invalid', () => {
    component.openSeatDialog(4);

    component.seatGame();

    expect(component.opponents[4]).toBeNull();
    expect(component.isSeatDialogOpen()).toBeTrue();
  });

  it('should not seat player when no seat is selected', () => {
    component.seatName.setValue('Chris');
    component.seatAvatar.setValue('man-4.svg');

    component.seatGame();

    expect(component.opponents[4]).toBeNull();
  });

  it('should not seat player when trimmed name is empty', () => {
    component.openSeatDialog(4);
    component.seatName.setValue('   ');
    component.seatAvatar.setValue('man-4.svg');

    component.seatGame();

    expect(component.opponents[4]).toBeNull();
    expect(component.isSeatDialogOpen()).toBeTrue();
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

  it('should call clipboard API when sharing the game url', async () => {
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

  it('should allow calling action handlers', () => {
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

  describe('active player display', () => {
    it('should have opponent with isActive flag', () => {
      expect(component.opponents[2]).toEqual(jasmine.objectContaining({ isActive: true, name: 'Noah' }));
    });

    it('should have dealer button role for an opponent', () => {
      expect(component.opponents[0]).toEqual(jasmine.objectContaining({ role: 'D', name: 'Alex' }));
    });
  });

  describe('Leave Game Dialog', () => {
    it('should initialize with isLeaveDialogOpen closed', () => {
      expect(component.isLeaveDialogOpen()).toBe(false);
    });

    it('should open leave dialog on canDeactivate()', () => {
      void component.canDeactivate();
      expect(component.isLeaveDialogOpen()).toBe(true);
    });

    it('should close an open seat dialog when canDeactivate is called', () => {
      component.openSeatDialog(4);

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
});
