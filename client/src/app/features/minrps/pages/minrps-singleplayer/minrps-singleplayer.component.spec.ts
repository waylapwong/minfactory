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
    mockService = jasmine.createSpyObj('MinRpsSingleplayerService', ['playGame', 'selectMove', 'setupNewGame'], {
      game: gameSignal.asReadonly(),
    });

    await TestBed.configureTestingModule({
      imports: [MinRpsSingleplayerComponent],
      providers: [provideZonelessChangeDetection(), { provide: MinRpsSingleplayerService, useValue: mockService }],
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
});
