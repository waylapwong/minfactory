import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinRpsMove } from '../../../../core/generated';
import { MinRpsGame } from '../../models/domains/minrps-game';
import { MinRpsSingleplayerService } from '../../services/minrps-singleplayer.service';
import { MinRpsSingleplayerComponent } from './minrps-singleplayer.component';

describe('MinRpsSingleplayerComponent', () => {
  let component: MinRpsSingleplayerComponent;
  let fixture: ComponentFixture<MinRpsSingleplayerComponent>;
  let mockService: jasmine.SpyObj<MinRpsSingleplayerService>;

  beforeEach(async () => {
    const cachedGame = signal(new MinRpsGame());
    mockService = jasmine.createSpyObj(
      'MinRpsSingleplayerService',
      ['playGame', 'selectMove', 'setupNewGame'],
      {
        game: cachedGame.asReadonly(),
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

  describe('submitText()', () => {
    it('should return "choose move", if no move is selected', () => {
      expect(component.submitText()).toBe('choose move');
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
    it('should call service selectMove', () => {
      component.selectMove(MinRpsMove.Rock);
      expect(mockService.selectMove).toHaveBeenCalledWith(MinRpsMove.Rock);
    });
  });
});
