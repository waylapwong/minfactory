import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { RoutingService } from '../../../../core/services/routing.service';
import { MinRpsGameService } from '../../services/minrps-game.service';
import { MinRpsMultiplayerService } from '../../services/minrps-multiplayer.service';
import { MinRpsMultiplayerComponent } from './minrps-multiplayer.component';

describe('MinRpsMultiplayerComponent', () => {
  let component: MinRpsMultiplayerComponent;
  let fixture: ComponentFixture<MinRpsMultiplayerComponent>;

  beforeEach(async () => {
    const mockGameService = jasmine.createSpyObj('MinRpsGameService', ['gameExistByID'], {
      games: signal([]),
    });
    const mockRoutingService = jasmine.createSpyObj('RoutingService', ['navigateTo']);
    const mockMultiplayerService = jasmine.createSpyObj('MinRpsMultiplayerService', [
      'connect',
      'disconnect',
      'onEvent',
      'offEvent',
      'sendJoinEvent',
      'sendLeaveEvent',
    ]);
    const mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ id: 'test-id' }),
      },
      queryParams: of({ id: 'test-id' }),
    };

    // Setup spy return values
    mockGameService.gameExistByID.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [MinRpsMultiplayerComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinRpsGameService, useValue: mockGameService },
        { provide: RoutingService, useValue: mockRoutingService },
        { provide: MinRpsMultiplayerService, useValue: mockMultiplayerService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MinRpsMultiplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
