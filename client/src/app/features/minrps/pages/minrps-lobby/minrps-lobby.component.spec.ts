import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoutingService } from '../../../../core/services/routing.service';
import { MinRpsGameService } from '../../services/minrps-game.service';
import { MinRpsLobbyComponent } from './minrps-lobby.component';

describe('MinRpsLobbyComponent', () => {
  let component: MinRpsLobbyComponent;
  let fixture: ComponentFixture<MinRpsLobbyComponent>;

  beforeEach(async () => {
    const mockGameService = jasmine.createSpyObj(
      'MinRpsGameService',
      ['createGame', 'deleteGame', 'refreshGames'],
      {
        games: signal([]),
      },
    );
    const mockRoutingService = jasmine.createSpyObj('RoutingService', ['navigateTo']);

    await TestBed.configureTestingModule({
      imports: [MinRpsLobbyComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinRpsGameService, useValue: mockGameService },
        { provide: RoutingService, useValue: mockRoutingService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRpsLobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
