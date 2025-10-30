import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinRpsMove } from '../../models/enums/minrps-move.enum';
import { MinRpsGameServiceMock } from '../../services/minrps-game.service.mock';
import { MinRpsGameComponent } from './minrps-game.component';
import { MinRpsGameService } from '../../services/minrps-game.service';

describe('MinRpsGameComponent', () => {
  let component: MinRpsGameComponent;
  let fixture: ComponentFixture<MinRpsGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinRpsGameComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: MinRpsGameService,
          useValue: MinRpsGameServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRpsGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('buttonText()', () => {
    it('should return "choose-move", if no move is selected', () => {
      component.selectedHeroMove.set(MinRpsMove.None);
      expect(component.buttonText()).toBe('choose move');
    });

    it('should return "play rock!", if a move is selected', () => {
      component.selectedHeroMove.set(MinRpsMove.Rock);
      expect(component.buttonText()).toBe('play rock!');
    });

    it('should return "play paper!", if a move is selected', () => {
      component.selectedHeroMove.set(MinRpsMove.Paper);
      expect(component.buttonText()).toBe('play paper!');
    });

    it('should return "play scissors!", if a move is selected', () => {
      component.selectedHeroMove.set(MinRpsMove.Scissors);
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
      component.selectedHeroMove.set(MinRpsMove.Rock);
      spyOn((component as any).minRPSGameService, 'startGame').and.resolveTo();
      await component.startGame();
      expect(component.selectedHeroMove()).toBe(MinRpsMove.None);
    });
  });
});
