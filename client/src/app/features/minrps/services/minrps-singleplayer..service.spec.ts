import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MinRpsPlayRepository } from '../repositories/minrps-play.repository';
import { MinRpsSingleplayerService } from './minrps-singleplayer.service';

describe('MinRpsSingleplayerService', () => {
  let service: MinRpsSingleplayerService;
  let mockRepository: jasmine.SpyObj<MinRpsPlayRepository>;

  beforeEach(() => {
    mockRepository = jasmine.createSpyObj('MinRpsPlayRepository', ['play']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinRpsSingleplayerService,
        { provide: MinRpsPlayRepository, useValue: mockRepository },
      ],
    });
    service = TestBed.inject(MinRpsSingleplayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
