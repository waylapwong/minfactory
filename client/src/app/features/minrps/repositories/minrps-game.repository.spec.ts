import { TestBed } from '@angular/core/testing';
import { MinRpsGameRepository } from './minrps-game.repository';

describe('MinRpsGameRepository', () => {
  let service: MinRpsGameRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MinRpsGameRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
