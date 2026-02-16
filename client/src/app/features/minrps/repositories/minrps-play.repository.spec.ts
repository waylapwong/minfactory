import { TestBed } from '@angular/core/testing';
import { MinRpsPlayRepository } from './minrps-play.repository';

describe('MinRpsPlayRepository', () => {
  let service: MinRpsPlayRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MinRpsPlayRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
