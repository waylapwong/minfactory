import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppPath } from '../../app.routes';
import { MinFactoryPath } from '../../features/minfactory/minfactory.routes';
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

  describe('navigateToLogin()', () => {
    it('should navigate to login page', () => {
      const spy = spyOn((service as any).router, 'navigate');
      service.navigateToLogin();
      expect(spy).toHaveBeenCalledWith([AppPath.Root, MinFactoryPath.Login]);
    });
  });

  describe('navigateToProfile()', () => {
    it('should navigate to profile page', () => {
      const spy = spyOn((service as any).router, 'navigate');
      service.navigateToProfile();
      expect(spy).toHaveBeenCalledWith([AppPath.Root, MinFactoryPath.Profile]);
    });
  });

  describe('navigateToMinRps()', () => {
    it('should navigate to minRPS', () => {
      const spy = spyOn((service as any).router, 'navigate');
      service.navigateToMinRps();
      expect(spy).toHaveBeenCalledWith([AppPath.MinRps]);
    });
  });

  describe('navigateToMinRpsSingleplayerGame()', () => {
    it('should navigate to minRPS singleplayer game', () => {
      const spy = spyOn((service as any).router, 'navigate');
      service.navigateToMinRpsSingleplayer();
      expect(spy).toHaveBeenCalledWith([AppPath.MinRps, MinRpsPath.Singleplayer]);
    });
  });

  describe('navigateToMinRpsOverview()', () => {
    it('should navigate to minRPS overview', () => {
      const spy = spyOn((service as any).router, 'navigate');
      service.navigateToMinRpsOverview();
      expect(spy).toHaveBeenCalledWith([AppPath.MinRps, MinRpsPath.Overview]);
    });
  });

  describe('navigateToMinRpsMultiplayer()', () => {
    it('should navigate to minRPS multiplayer with game id', () => {
      const spy = spyOn((service as any).router, 'navigate');
      service.navigateToMinRpsMultiplayer('game-123');
      expect(spy).toHaveBeenCalledWith([AppPath.MinRps, MinRpsPath.Multiplayer, 'game-123']);
    });
  });
});
