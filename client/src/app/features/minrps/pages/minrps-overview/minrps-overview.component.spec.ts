import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/services/routing.service';
import { Color } from '../../../../shared/enums/color.enum';
import { MinRpsOverviewViewModel } from '../../models/viewmodels/minrps-overview.viewmodel';
import { MinRpsGameService } from '../../services/minrps-game.service';
import { MinRpsOverviewComponent } from './minrps-overview.component';

describe('MinRpsOverviewComponent', () => {
  let component: MinRpsOverviewComponent;
  let fixture: ComponentFixture<MinRpsOverviewComponent>;
  let mockGameService: jasmine.SpyObj<MinRpsGameService>;
  let mockRoutingService: jasmine.SpyObj<RoutingService>;

  beforeEach(async () => {
    mockGameService = jasmine.createSpyObj(
      'MinRpsGameService',
      ['createGame', 'deleteGame', 'refreshGames'],
      {
        games: signal([]),
      },
    );
    mockRoutingService = jasmine.createSpyObj('RoutingService', ['navigateToMinRpsMultiplayer']);

    await TestBed.configureTestingModule({
      imports: [MinRpsOverviewComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinRpsGameService, useValue: mockGameService },
        { provide: RoutingService, useValue: mockRoutingService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRpsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have Color enum available', () => {
    expect(component.Color).toBe(Color);
  });

  it('should inject game service games signal', () => {
    expect(component.games).toBe(mockGameService.games);
  });

  describe('ngOnInit()', () => {
    it('should call refreshGames on init', () => {
      expect(mockGameService.refreshGames).toHaveBeenCalled();
    });
  });

  describe('newGameName getter', () => {
    it('should return the name form control', () => {
      const control = component.newGameName;
      expect(control).toBeTruthy();
      expect(control.value).toBe('');
    });
  });

  describe('createGame()', () => {
    it('should create game and close dialog when form is valid', async () => {
      mockGameService.createGame.and.returnValue(Promise.resolve());
      component.newGameFormGroup.patchValue({ name: 'Test Game' });
      component.isNewGameDialogOpen.set(true);

      await component.createGame();

      expect(mockGameService.createGame).toHaveBeenCalledWith('Test Game');
      expect(component.isNewGameDialogOpen()).toBe(false);
    });

    it('should not create game when form is invalid', async () => {
      component.newGameFormGroup.patchValue({ name: '' });
      component.isNewGameDialogOpen.set(true);

      await component.createGame();

      expect(mockGameService.createGame).not.toHaveBeenCalled();
      expect(component.isNewGameDialogOpen()).toBe(true);
    });

    it('should not create game when name is too short', async () => {
      component.newGameFormGroup.patchValue({ name: 'A' });

      await component.createGame();

      expect(mockGameService.createGame).not.toHaveBeenCalled();
    });

    it('should not create game when name is too long', async () => {
      component.newGameFormGroup.patchValue({ name: 'A'.repeat(17) });

      await component.createGame();

      expect(mockGameService.createGame).not.toHaveBeenCalled();
    });
  });

  describe('deleteGame()', () => {
    it('should call deleteGame service and stop event propagation', async () => {
      mockGameService.deleteGame.and.returnValue(Promise.resolve());
      const mockEvent = jasmine.createSpyObj('MouseEvent', ['stopPropagation']);

      await component.deleteGame('test-id', mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(mockGameService.deleteGame).toHaveBeenCalledWith('test-id');
    });
  });

  describe('navigateToMulitplayerPage()', () => {
    it('should navigate to multiplayer page with game id', () => {
      component.navigateToMulitplayerPage('test-game-id');

      expect(mockRoutingService.navigateToMinRpsMultiplayer).toHaveBeenCalledWith('test-game-id');
    });
  });

  describe('openNewGameDialog()', () => {
    it('should reset form group and open dialog', () => {
      component.newGameFormGroup.patchValue({ name: 'Old Name' });
      component.isNewGameDialogOpen.set(false);

      component.openNewGameDialog();

      expect(component.newGameFormGroup.value.name).toBe('');
      expect(component.isNewGameDialogOpen()).toBe(true);
    });
  });

  describe('form validation', () => {
    it('should require name field', () => {
      const control = component.newGameName;
      control.setValue('');
      expect(control.hasError('required')).toBe(true);
    });

    it('should enforce minimum length of 2', () => {
      const control = component.newGameName;
      control.setValue('A');
      expect(control.hasError('minlength')).toBe(true);
    });

    it('should enforce maximum length of 16', () => {
      const control = component.newGameName;
      control.setValue('A'.repeat(17));
      expect(control.hasError('maxlength')).toBe(true);
    });

    it('should be valid with proper length', () => {
      const control = component.newGameName;
      control.setValue('Valid Name');
      expect(control.valid).toBe(true);
    });
  });
});
