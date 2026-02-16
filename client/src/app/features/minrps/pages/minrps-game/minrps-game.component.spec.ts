import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinRpsMove } from '../../models/enums/minrps-move.enum';
import { MinRpsGameService } from '../../services/minrps-game.service';
import { MinRpsGameServiceMock } from '../../services/minrps-game.service.mock';
import { MinRpsGameComponent } from './minrps-game.component';

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
      component.selectedMove.set(MinRpsMove.None);
      expect(component.submitText()).toBe('choose move');
    });

    it('should return "play rock!", if a move is selected', () => {
      component.selectedMove.set(MinRpsMove.Rock);
      expect(component.submitText()).toBe('play rock!');
    });

    it('should return "play paper!", if a move is selected', () => {
      component.selectedMove.set(MinRpsMove.Paper);
      expect(component.submitText()).toBe('play paper!');
    });

    it('should return "play scissors!", if a move is selected', () => {
      component.selectedMove.set(MinRpsMove.Scissors);
      expect(component.submitText()).toBe('play scissors!');
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
      await component.playGame();
      expect(spy).toHaveBeenCalled();
    });

    it('should reset selected move', async () => {
      component.selectedMove.set(MinRpsMove.Rock);
      spyOn((component as any).minRPSGameService, 'startGame').and.resolveTo();
      await component.playGame();
      expect(component.selectedMove()).toBe(MinRpsMove.None);
    });
  });
});
