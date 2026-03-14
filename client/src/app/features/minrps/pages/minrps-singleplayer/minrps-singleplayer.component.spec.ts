import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinRpsMove } from '../../../../core/generated';
import { RoutingService } from '../../../../core/services/routing.service';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRpsSingleplayerViewModel } from '../../models/viewmodels/minrps-singleplayer.viewmodel';
import { MinRpsSingleplayerService } from '../../services/minrps-singleplayer.service';
import { MinRpsSingleplayerComponent } from './minrps-singleplayer.component';

describe('MinRpsSingleplayerComponent', () => {
  let component: MinRpsSingleplayerComponent;
  let fixture: ComponentFixture<MinRpsSingleplayerComponent>;
  let mockService: jasmine.SpyObj<MinRpsSingleplayerService>;
  let mockRoutingService: jasmine.SpyObj<RoutingService>;
  let gameSignal: any;

  beforeEach(async () => {
    gameSignal = signal(new MinRpsSingleplayerViewModel());
    mockService = jasmine.createSpyObj('MinRpsSingleplayerService', ['playGame', 'selectMove', 'setupNewGame'], {
      game: gameSignal.asReadonly(),
    });
    mockRoutingService = jasmine.createSpyObj('RoutingService', ['navigateToMinRps']);

    await TestBed.configureTestingModule({
      imports: [MinRpsSingleplayerComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinRpsSingleplayerService, useValue: mockService },
        { provide: RoutingService, useValue: mockRoutingService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRpsSingleplayerComponent);
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

  it('should inject game signal from service', () => {
    expect(component.game).toBe(mockService.game);
  });

  it('should have selectable moves array', () => {
    expect(component.selectableMoves).toEqual([MinRpsMove.Rock, MinRpsMove.Paper, MinRpsMove.Scissors]);
  });

  describe('submitText computed signal', () => {
    it('should return "Wähle einen Zug" when no move is selected', () => {
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

  describe('ngOnInit()', () => {
    it('should trigger new game setup process', () => {
      component.ngOnInit();
      expect(mockService.setupNewGame).toHaveBeenCalledWith(true);
    });
  });

  describe('ngOnDestroy()', () => {
    it('should resolve any pending canDeactivate promise with false', async () => {
      const promise = component.canDeactivate();
      component.ngOnDestroy();
      await expectAsync(promise).toBeResolvedTo(false);
    });
  });

  describe('playGame()', () => {
    it('should trigger play game process', async () => {
      mockService.playGame.and.returnValue(Promise.resolve());
      await component.playGame();
      expect(mockService.playGame).toHaveBeenCalled();
    });
  });

  describe('selectMove()', () => {
    it('should update selectedMove with Rock', () => {
      component.selectMove(MinRpsMove.Rock);
      expect(component.selectedMove()).toBe(MinRpsMove.Rock);
    });

    it('should update selectedMove with Paper', () => {
      component.selectMove(MinRpsMove.Paper);
      expect(component.selectedMove()).toBe(MinRpsMove.Paper);
    });

    it('should update selectedMove with Scissors', () => {
      component.selectMove(MinRpsMove.Scissors);
      expect(component.selectedMove()).toBe(MinRpsMove.Scissors);
    });
  });

  describe('canDeactivate()', () => {
    it('should open the leave dialog', () => {
      component.isLeaveDialogOpen.set(false);
      component.canDeactivate();
      expect(component.isLeaveDialogOpen()).toBe(true);
    });

    it('should return a Promise', async () => {
      const result = component.canDeactivate();
      expect(result).toBeInstanceOf(Promise);
      component.confirmLeave();
      await expectAsync(result).toBeResolvedTo(true);
    });

    it('should resolve previous pending promise with false when called again', async () => {
      const firstPromise = component.canDeactivate();
      component.canDeactivate();
      await expectAsync(firstPromise).toBeResolvedTo(false);
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
});
