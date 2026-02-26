import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinRpsMove } from '../../../../core/generated';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRpsSingleplayerViewModel } from '../../models/viewmodels/minrps-singleplayer.viewmodel';
import { MinRpsSingleplayerService } from '../../services/minrps-singleplayer.service';
import { MinRpsSingleplayerComponent } from './minrps-singleplayer.component';

describe('MinRpsSingleplayerComponent', () => {
  let component: MinRpsSingleplayerComponent;
  let fixture: ComponentFixture<MinRpsSingleplayerComponent>;
  let mockService: jasmine.SpyObj<MinRpsSingleplayerService>;
  let gameSignal: any;

  beforeEach(async () => {
    gameSignal = signal(new MinRpsSingleplayerViewModel());
    mockService = jasmine.createSpyObj(
      'MinRpsSingleplayerService',
      ['playGame', 'selectMove', 'setupNewGame'],
      {
        game: gameSignal.asReadonly(),
      },
    );

    await TestBed.configureTestingModule({
      imports: [MinRpsSingleplayerComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinRpsSingleplayerService, useValue: mockService },
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
    expect(component.selectableMoves).toEqual([
      MinRpsMove.Rock,
      MinRpsMove.Paper,
      MinRpsMove.Scissors,
    ]);
  });

  describe('submitText computed signal', () => {
    it('should return "choose move" when no move is selected', () => {
      const vm = new MinRpsSingleplayerViewModel();
      vm.player1SelectedMove = MinRpsMove.None;
      gameSignal.set(vm);
      expect(component.submitText()).toBe('choose move');
    });

    it('should return "play rock!" when rock is selected', () => {
      const vm = new MinRpsSingleplayerViewModel();
      vm.player1SelectedMove = MinRpsMove.Rock;
      gameSignal.set(vm);
      expect(component.submitText()).toBe('play rock!');
    });

    it('should return "play paper!" when paper is selected', () => {
      const vm = new MinRpsSingleplayerViewModel();
      vm.player1SelectedMove = MinRpsMove.Paper;
      gameSignal.set(vm);
      expect(component.submitText()).toBe('play paper!');
    });

    it('should return "play scissors!" when scissors is selected', () => {
      const vm = new MinRpsSingleplayerViewModel();
      vm.player1SelectedMove = MinRpsMove.Scissors;
      gameSignal.set(vm);
      expect(component.submitText()).toBe('play scissors!');
    });

    it('should return empty string for unknown move', () => {
      const vm = new MinRpsSingleplayerViewModel();
      vm.player1SelectedMove = 'unknown' as MinRpsMove;
      gameSignal.set(vm);
      expect(component.submitText()).toBe('');
    });
  });

  describe('ngOnInit()', () => {
    it('should trigger new game setup process', () => {
      component.ngOnInit();
      expect(mockService.setupNewGame).toHaveBeenCalled();
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
    it('should call service selectMove with Rock', () => {
      component.selectMove(MinRpsMove.Rock);
      expect(mockService.selectMove).toHaveBeenCalledWith(MinRpsMove.Rock);
    });

    it('should call service selectMove with Paper', () => {
      component.selectMove(MinRpsMove.Paper);
      expect(mockService.selectMove).toHaveBeenCalledWith(MinRpsMove.Paper);
    });

    it('should call service selectMove with Scissors', () => {
      component.selectMove(MinRpsMove.Scissors);
      expect(mockService.selectMove).toHaveBeenCalledWith(MinRpsMove.Scissors);
    });
  });
});
