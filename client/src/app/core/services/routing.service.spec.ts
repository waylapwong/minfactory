import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { Path } from '../../app.routes';
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
            navigate: () => {}
          }
        }
      ]
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
      expect(spy).toHaveBeenCalledWith([Path.Home]);
    });
  });

  describe('navigateToMinRPS()', () => {
    it('should navigate to minRPS game', () => {
      const spy = spyOn((service as any).router, 'navigate');
      service.navigateToMinRPS();
      expect(spy).toHaveBeenCalledWith([Path.MinRPS]);
    });
  });
});
