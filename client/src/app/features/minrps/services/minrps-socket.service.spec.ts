import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MinRpsSocketService } from './minrps-socket.service';

describe('MinRpsSocketService', () => {
  let service: MinRpsSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(MinRpsSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
