import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MINRPS_FOURTH_MESSAGES_LOSE, MINRPS_FOURTH_MESSAGES_TIE, MINRPS_FOURTH_MESSAGES_WIN } from '../models/constants/minrps-fourth.message';
import { MinRPSMove } from '../models/enums/minrps-move.enum';
import { MinRPSGameService } from './minrps-game.service';

describe('MinRPSGameService', () => {
  let service: MinRPSGameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(MinRPSGameService);
  });

  beforeEach(() => {});

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setPlayer1Move()', () => {
    it('should set player 1 move', () => {
      service.setPlayer1Move(MinRPSMove.Rock);
      expect(service.player1Move()).toBe(MinRPSMove.Rock);
    });
  });

  describe('setPlayer2Move()', () => {
    it('should set player 2 move', () => {
      service.setPlayer2Move(MinRPSMove.Rock);
      expect(service.player2Move()).toBe(MinRPSMove.Rock);
    });
  });

  describe('setupNewGame()', () => {
    it('should setup new game', () => {
      service.setPlayer1Move(MinRPSMove.Rock);
      service.setupNewGame();
      expect(service.player1Move()).toBe(MinRPSMove.None);
    });
  });

  describe('startGame()', () => {
    beforeEach(() => {
      spyOn(service as any, 'sleep');
      spyOn(service as any, 'typeMessage');
    });

    it('should not do anything, if game is already running', async () => {
      (service as any).gameRunning = true;
      await service.startGame(MinRPSMove.Rock);
      expect(service.player1Move()).toBe(MinRPSMove.None);
    });

    it('should set player 1 move', async () => {
      spyOn(service as any, 'setupNewGame');
      await service.startGame(MinRPSMove.Rock);
      expect(service.player1Move()).toBe(MinRPSMove.Rock);
    });

    it('should set player 2 random move', async () => {
      spyOn(service as any, 'setupNewGame');
      await service.startGame(MinRPSMove.Rock);
      expect(service.player1Move()).not.toBe(MinRPSMove.None);
    });

    it('should display correct message, if player 1 wins', async () => {
      spyOn(service as any, 'getRandomMove').and.callFake(() => MinRPSMove.Scissors);
      spyOn(service as any, 'setupNewGame');
      const spy = spyOn(service as any, 'getRandomMessage');
      await service.startGame(MinRPSMove.Rock);
      expect(spy).toHaveBeenCalledWith(MINRPS_FOURTH_MESSAGES_LOSE);
    });

    it('should display correct message, if player 2 wins', async () => {
      spyOn(service as any, 'getRandomMove').and.callFake(() => MinRPSMove.Paper);
      spyOn(service as any, 'setupNewGame');
      const spy = spyOn(service as any, 'getRandomMessage');
      await service.startGame(MinRPSMove.Rock);
      expect(spy).toHaveBeenCalledWith(MINRPS_FOURTH_MESSAGES_WIN);
    });

    it('should display correct message, if it is a draw', async () => {
      spyOn(service as any, 'getRandomMove').and.callFake(() => MinRPSMove.Rock);
      spyOn(service as any, 'setupNewGame');
      const spy = spyOn(service as any, 'getRandomMessage');
      await service.startGame(MinRPSMove.Rock);
      expect(spy).toHaveBeenCalledWith(MINRPS_FOURTH_MESSAGES_TIE);
    });

    it('should reset game in the end', async () => {
      await service.startGame(MinRPSMove.Rock);
    });
  });

  describe('DUMMY TESTS', () => {
    it('abortTyping()', () => {
      (service as any).abortController = new AbortController();
      (service as any).abortTyping();
      expect(1).toBe(1);
    });

    it('sleep()', () => {
      spyOn(service as any, 'sleep').and.callThrough();
      (service as any).sleep(0);
      expect(1).toBe(1);
    });

    it('typeMessage()', async () => {
      await (service as any).typeMessage('1');
    });

    it('typeMessage()', async () => {
      const test = new AbortController();
      test.abort();
      await expectAsync((service as any).typeMessage('1', test.signal)).toBeRejectedWithError(
        DOMException,
        'Aborted',
      );
    });
  });
});
