import { TestBed } from '@angular/core/testing';
import { MinRpsMultiplayerService } from './minrps-multiplayer.service';

describe('MinRpsMultiplayerService', () => {
  let service: MinRpsMultiplayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MinRpsMultiplayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
