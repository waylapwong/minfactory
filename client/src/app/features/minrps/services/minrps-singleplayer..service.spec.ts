import { TestBed } from '@angular/core/testing';
import { MinRpsSingleplayerService } from './minrps-singleplayer.service';

describe('MinRpsSingleplayerService', () => {
  let service: MinRpsSingleplayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MinRpsSingleplayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
