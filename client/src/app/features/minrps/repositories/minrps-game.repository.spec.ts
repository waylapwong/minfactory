import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MinRPSApiService } from '../../../core/generated';
import { MinRpsGameRepository } from './minrps-game.repository';

describe('MinRpsGameRepository', () => {
  let service: MinRpsGameRepository;
  let mockApiService: jasmine.SpyObj<MinRPSApiService>;

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('MinRPSApiService', [
      'createMinRpsGame',
      'deleteMinRpsGame',
      'getMinRpsGame',
      'getAllMinRpsGames',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinRpsGameRepository,
        { provide: MinRPSApiService, useValue: mockApiService },
      ],
    });
    service = TestBed.inject(MinRpsGameRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
