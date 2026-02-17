import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MinRpsSocketRepository } from './minrps-socket.repository';

describe('MinRpsSocketRepository', () => {
  let service: MinRpsSocketRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(MinRpsSocketRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
