import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppPath } from '../../app.routes';
import { MinFactoryPath } from '../../features/minfactory/minfactory.routes';
import { MinRpsPath } from '../../features/minrps/minrps.routes';
import { ROUTER_MOCK } from '../../shared/mocks/router.mock';
import { RoutingService } from './routing.service';

describe('RoutingService', () => {
  let service: RoutingService;

  beforeEach(() => {
    ROUTER_MOCK.navigate.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: Router,
          useValue: ROUTER_MOCK as unknown as Router,
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
      service.navigateToHomePage();
      expect(ROUTER_MOCK.navigate).toHaveBeenCalledWith([AppPath.Root]);
    });
  });

  describe('navigateToLogin()', () => {
    it('should navigate to login page', () => {
      service.navigateToLogin();
      expect(ROUTER_MOCK.navigate).toHaveBeenCalledWith([AppPath.Root, MinFactoryPath.Login]);
    });
  });

  describe('navigateToProfile()', () => {
    it('should navigate to profile page', () => {
      service.navigateToProfile();
      expect(ROUTER_MOCK.navigate).toHaveBeenCalledWith([AppPath.Root, MinFactoryPath.Profile]);
    });
  });

  describe('navigateToMinRps()', () => {
    it('should navigate to minRPS', () => {
      service.navigateToMinRps();
      expect(ROUTER_MOCK.navigate).toHaveBeenCalledWith([AppPath.MinRps]);
    });
  });

  describe('navigateToMinRpsSingleplayerGame()', () => {
    it('should navigate to minRPS singleplayer game', () => {
      service.navigateToMinRpsSingleplayer();
      expect(ROUTER_MOCK.navigate).toHaveBeenCalledWith([AppPath.MinRps, MinRpsPath.Singleplayer]);
    });
  });

  describe('navigateToMinRpsOverview()', () => {
    it('should navigate to minRPS overview', () => {
      service.navigateToMinRpsOverview();
      expect(ROUTER_MOCK.navigate).toHaveBeenCalledWith([AppPath.MinRps, MinRpsPath.Overview]);
    });
  });

  describe('navigateToMinRpsMultiplayer()', () => {
    it('should navigate to minRPS multiplayer with game id', () => {
      service.navigateToMinRpsMultiplayer('game-123');
      expect(ROUTER_MOCK.navigate).toHaveBeenCalledWith([AppPath.MinRps, MinRpsPath.Multiplayer, 'game-123']);
    });
  });
});
