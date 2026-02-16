import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { RoutingService } from '../../../../core/services/routing.service';
import { MinRpsGameService } from '../../services/minrps-game.service';
import { MinRpsSocketService } from '../../services/minrps-socket.service';
import { MinRpsMultiplayerComponent } from './minrps-multiplayer.component';

describe('MinRpsMultiplayerComponent', () => {
  let component: MinRpsMultiplayerComponent;
  let fixture: ComponentFixture<MinRpsMultiplayerComponent>;

  beforeEach(async () => {
    const mockGameService = jasmine.createSpyObj('MinRpsGameService', ['gameExistByID'], {
      games: signal([]),
    });
    const mockRoutingService = jasmine.createSpyObj('RoutingService', ['navigateTo']);
    const mockSocketService = jasmine.createSpyObj('MinRpsSocketService', [
      'connect',
      'disconnect',
      'emit',
      'fromEvent',
    ]);
    const mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ id: 'test-id' }),
      },
      queryParams: of({ id: 'test-id' }),
    };

    // Setup spy return values
    mockSocketService.fromEvent.and.returnValue(of({}));
    mockGameService.gameExistByID.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [MinRpsMultiplayerComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinRpsGameService, useValue: mockGameService },
        { provide: RoutingService, useValue: mockRoutingService },
        { provide: MinRpsSocketService, useValue: mockSocketService },
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
