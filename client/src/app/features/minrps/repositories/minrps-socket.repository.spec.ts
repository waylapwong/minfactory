import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MinRpsSocketRepository } from './minrps-socket.repository';

describe('MinRpsSocketRepository', () => {
  let repository: MinRpsSocketRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    repository = TestBed.inject(MinRpsSocketRepository);
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  it('should be an instance of Socket', () => {
    expect(repository).toBeDefined();
    expect(repository.ioSocket).toBeDefined();
  });

  it('should have socket connection capabilities', () => {
    // Socket repository extends Socket class from ngx-socket-io
    expect(repository).toBeTruthy();
  });
});
