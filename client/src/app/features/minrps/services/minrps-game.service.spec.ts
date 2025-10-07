import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MinRPSGameService } from './minrps-game.service';

describe('MinRPSGameService', () => {
  let service: MinRPSGameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(MinRPSGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
