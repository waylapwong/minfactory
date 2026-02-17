import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MinRpsSocketRepository } from '../repositories/minrps-socket.repository';
import { MinRpsMultiplayerService } from './minrps-multiplayer.service';

describe('MinRpsMultiplayerService', () => {
  let service: MinRpsMultiplayerService;

  beforeEach(() => {
    const mockSocketRepository = jasmine.createSpyObj('MinRpsSocketRepository', [
      'connect',
      'disconnect',
      'on',
      'off',
      'emit',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: MinRpsSocketRepository, useValue: mockSocketRepository },
      ],
    });
    service = TestBed.inject(MinRpsMultiplayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
