import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinRPSMove } from '../../models/enums/minrps-move.enum';
import { MinRPSGameServiceMock } from '../../services/minrps-game.service.mock';
import { MinRPSGameComponent } from './minrps-game.component';

describe('MinRPSGameComponent', () => {
  let component: MinRPSGameComponent;
  let fixture: ComponentFixture<MinRPSGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRPSGameComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: 'MinRPSGameService',
          useValue: MinRPSGameServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRPSGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('buttonText()', () => {
    it('should return "choose-move", if no move is selected', () => {
      component.selectedHeroMove.set(MinRPSMove.None);
      expect(component.buttonText()).toBe('choose move');
    });

    it('should return "play rock!", if a move is selected', () => {
      component.selectedHeroMove.set(MinRPSMove.Rock);
      expect(component.buttonText()).toBe('play rock!');
    });

    it('should return "play paper!", if a move is selected', () => {
      component.selectedHeroMove.set(MinRPSMove.Paper);
      expect(component.buttonText()).toBe('play paper!');
    });

    it('should return "play scissors!", if a move is selected', () => {
      component.selectedHeroMove.set(MinRPSMove.Scissors);
      expect(component.buttonText()).toBe('play scissors!');
    });
  });

  describe('ngOnInit()', () => {
    it('should trigger new game setup process', () => {
      const spy = spyOn((component as any).minRPSGameService, 'setupNewGame');
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('startGame()', () => {
    it('should trigger start game process', async () => {
      const spy = spyOn((component as any).minRPSGameService, 'startGame');
      await component.startGame();
      expect(spy).toHaveBeenCalled();
    });

    it('should reset selected move', async () => {
      component.selectedHeroMove.set(MinRPSMove.Rock);
      spyOn((component as any).minRPSGameService, 'startGame').and.resolveTo();
      await component.startGame();
      expect(component.selectedHeroMove()).toBe(MinRPSMove.None);
    });
  });
});
