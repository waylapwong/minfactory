import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppPath } from '../../../app.routes';
import { MinFactoryPath } from '../../../features/minfactory/minfactory.routes';
import { MinPokerPath } from '../../../features/minpoker/minpoker.routes';
import { MinRpsPath } from '../../../features/minrps/minrps.routes';
import { ROUTER_MOCK } from '../mocks/router.mock';
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

  describe('navigateToMinPoker()', () => {
    it('should navigate to minPoker', () => {
      service.navigateToMinPoker();
      expect(ROUTER_MOCK.navigate).toHaveBeenCalledWith([AppPath.MinPoker]);
    });
  });

  describe('navigateToMinPokerGame()', () => {
    it('should navigate to minPoker game with id', () => {
      service.navigateToMinPokerGame('game-123');
      expect(ROUTER_MOCK.navigate).toHaveBeenCalledWith([AppPath.MinPoker, MinPokerPath.Game, 'game-123']);
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

  describe('navigateToApps()', () => {
    it('should navigate to apps page', () => {
      service.navigateToApps();
      expect(ROUTER_MOCK.navigate).toHaveBeenCalledWith([AppPath.Root, MinFactoryPath.Apps]);
    });
  });

  describe('navigateToMinPokerMyGames()', () => {
    it('should navigate to my games page', () => {
      service.navigateToMinPokerMyGames();
      expect(ROUTER_MOCK.navigate).toHaveBeenCalledWith([AppPath.MinPoker, MinPokerPath.MyGames]);
    });
  });

  describe('navigateToMinPokerPublicGames()', () => {
    it('should navigate to public games page', () => {
      service.navigateToMinPokerPublicGames();
      expect(ROUTER_MOCK.navigate).toHaveBeenCalledWith([AppPath.MinPoker, MinPokerPath.PublicGames]);
    });
  });

  describe('navigateToRegister()', () => {
    it('should navigate to register page', () => {
      service.navigateToRegister();
      expect(ROUTER_MOCK.navigate).toHaveBeenCalledWith([AppPath.Root, MinFactoryPath.Register]);
    });
  });
});
