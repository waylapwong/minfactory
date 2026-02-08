import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppPath } from '../../app.routes';
import { MinRpsPath } from '../../features/minrps/minrps.routes';
import { RoutingService } from './routing.service';

describe('RoutingService', () => {
  let service: RoutingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: Router,
          useValue: {
            navigate: () => {},
          },
        },
      ],
    });
    service = TestBed.inject(RoutingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('navigateToHomePage()', () => {
    it('should navigate to home page', () => {
      const spy = spyOn((service as any).router, 'navigate');
      service.navigateToHomePage();
      expect(spy).toHaveBeenCalledWith([AppPath.Root]);
    });
  });

  describe('navigateToMinRps()', () => {
    it('should navigate to minRPS', () => {
      const spy = spyOn((service as any).router, 'navigate');
      service.navigateToMinRps();
      expect(spy).toHaveBeenCalledWith([AppPath.MinRps]);
    });
  });

  describe('navigateToMinRpsGame()', () => {
    it('should navigate to minRPS game', () => {
      const spy = spyOn((service as any).router, 'navigate');
      service.navigateToMinRpsGame();
      expect(spy).toHaveBeenCalledWith([AppPath.MinRps, MinRpsPath.Game]);
    });
  });
});
