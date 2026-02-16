import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MinRPSApiService } from '../../../core/generated';
import { MinRpsPlayRepository } from './minrps-play.repository';

describe('MinRpsPlayRepository', () => {
  let service: MinRpsPlayRepository;
  let mockApiService: jasmine.SpyObj<MinRPSApiService>;

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('MinRPSApiService', ['playMinRpsGame']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinRpsPlayRepository,
        { provide: MinRPSApiService, useValue: mockApiService },
      ],
    });
    service = TestBed.inject(MinRpsPlayRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
