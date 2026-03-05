import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MinRpsMove, MinRpsPlayResultDto, MinRpsResult } from '../../../core/generated';
import { MinRpsPlayRepository } from '../repositories/minrps-play.repository';
import { MinRpsSingleplayerService } from './minrps-singleplayer.service';

describe('MinRpsSingleplayerService', () => {
  let service: MinRpsSingleplayerService;
  let mockRepository: jasmine.SpyObj<MinRpsPlayRepository>;
  const PUFFER_TIME = 2000;

  beforeEach(() => {
    mockRepository = jasmine.createSpyObj('MinRpsPlayRepository', ['play']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinRpsSingleplayerService,
        { provide: MinRpsPlayRepository, useValue: mockRepository },
      ],
    });
    service = TestBed.inject(MinRpsSingleplayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('game signal', () => {
    it('should return initial game state as viewmodel', () => {
      const game = service.game();

      expect(game).toBeDefined();
      expect(game.player1Move).toBe(MinRpsMove.None);
      expect(game.player2Move).toBe(MinRpsMove.None);
      expect(game.result).toBe(MinRpsResult.None);
    });
  });

  describe('setupNewGame()', () => {
    it('should reset game to initial state', () => {
      service.setupNewGame();

      const game = service.game();
      expect(game.player1Move).toBe(MinRpsMove.None);
      expect(game.player2Move).toBe(MinRpsMove.None);
      expect(game.result).toBe(MinRpsResult.None);
    });

    it('should create a new game instance', () => {
      const game1 = service.game();
      service.setupNewGame();
      const game2 = service.game();

      expect(game1).not.toBe(game2);
    });
  });

  describe('playGame()', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should set player1Move from player1SelectedMove', async () => {
      const mockResult: MinRpsPlayResultDto = {
        player1Move: MinRpsMove.Rock,
        player2Move: MinRpsMove.Scissors,
        result: MinRpsResult.Player1,
      };
      mockRepository.play.and.returnValue(Promise.resolve(mockResult));

      await service.playGame(MinRpsMove.Rock);

      const game = service.game();
      expect(game.player1Move).toBe(MinRpsMove.Rock);
    });

    it('should call repository with correct DTO', async () => {
      const mockResult: MinRpsPlayResultDto = {
        player1Move: MinRpsMove.Paper,
        player2Move: MinRpsMove.Rock,
        result: MinRpsResult.Player1,
      };
      mockRepository.play.and.returnValue(Promise.resolve(mockResult));

      await service.playGame(MinRpsMove.Paper);

      expect(mockRepository.play).toHaveBeenCalledWith({
        player1Move: MinRpsMove.Paper,
      });
    });

    it('should update game with result from repository', async () => {
      const mockResult: MinRpsPlayResultDto = {
        player1Move: MinRpsMove.Scissors,
        player2Move: MinRpsMove.Paper,
        result: MinRpsResult.Player1,
      };
      mockRepository.play.and.returnValue(Promise.resolve(mockResult));

      await service.playGame(MinRpsMove.Scissors);

      const game = service.game();
      expect(game.player1Move).toBe(MinRpsMove.Scissors);
      expect(game.player2Move).toBe(MinRpsMove.Paper);
      expect(game.result).toBe(MinRpsResult.Player1);
    });

    it('should handle Player2 win result', async () => {
      const mockResult: MinRpsPlayResultDto = {
        player1Move: MinRpsMove.Rock,
        player2Move: MinRpsMove.Paper,
        result: MinRpsResult.Player2,
      };
      mockRepository.play.and.returnValue(Promise.resolve(mockResult));

      await service.playGame(MinRpsMove.Rock);

      const game = service.game();
      expect(game.result).toBe(MinRpsResult.Player2);
    });

    it('should handle Draw result', async () => {
      const mockResult: MinRpsPlayResultDto = {
        player1Move: MinRpsMove.Rock,
        player2Move: MinRpsMove.Rock,
        result: MinRpsResult.Draw,
      };
      mockRepository.play.and.returnValue(Promise.resolve(mockResult));

      await service.playGame(MinRpsMove.Rock);

      const game = service.game();
      expect(game.result).toBe(MinRpsResult.Draw);
    });

    it('should reset game after PUFFER_TIME', async () => {
      const mockResult: MinRpsPlayResultDto = {
        player1Move: MinRpsMove.Rock,
        player2Move: MinRpsMove.Scissors,
        result: MinRpsResult.Player1,
      };
      mockRepository.play.and.returnValue(Promise.resolve(mockResult));

      await service.playGame(MinRpsMove.Rock);

      expect(service.game().result).toBe(MinRpsResult.Player1);

      jasmine.clock().tick(PUFFER_TIME);

      const game = service.game();
      expect(game.player1Move).toBe(MinRpsMove.None);
      expect(game.player2Move).toBe(MinRpsMove.None);
      expect(game.result).toBe(MinRpsResult.None);
    });

    it('should not reset game before PUFFER_TIME elapses', async () => {
      const mockResult: MinRpsPlayResultDto = {
        player1Move: MinRpsMove.Rock,
        player2Move: MinRpsMove.Scissors,
        result: MinRpsResult.Player1,
      };
      mockRepository.play.and.returnValue(Promise.resolve(mockResult));

      await service.playGame(MinRpsMove.Rock);

      jasmine.clock().tick(PUFFER_TIME - 100);

      const game = service.game();
      expect(game.result).toBe(MinRpsResult.Player1);
      expect(game.player1Move).toBe(MinRpsMove.Rock);
    });

    it('should handle all moves: Rock vs Paper', async () => {
      const mockResult: MinRpsPlayResultDto = {
        player1Move: MinRpsMove.Rock,
        player2Move: MinRpsMove.Paper,
        result: MinRpsResult.Player2,
      };
      mockRepository.play.and.returnValue(Promise.resolve(mockResult));

      await service.playGame(MinRpsMove.Rock);

      const game = service.game();
      expect(game.player1Move).toBe(MinRpsMove.Rock);
      expect(game.player2Move).toBe(MinRpsMove.Paper);
      expect(game.result).toBe(MinRpsResult.Player2);
    });

    it('should handle all moves: Paper vs Scissors', async () => {
      const mockResult: MinRpsPlayResultDto = {
        player1Move: MinRpsMove.Paper,
        player2Move: MinRpsMove.Scissors,
        result: MinRpsResult.Player2,
      };
      mockRepository.play.and.returnValue(Promise.resolve(mockResult));

      await service.playGame(MinRpsMove.Paper);

      const game = service.game();
      expect(game.player1Move).toBe(MinRpsMove.Paper);
      expect(game.player2Move).toBe(MinRpsMove.Scissors);
      expect(game.result).toBe(MinRpsResult.Player2);
    });

    it('should handle all moves: Scissors vs Rock', async () => {
      const mockResult: MinRpsPlayResultDto = {
        player1Move: MinRpsMove.Scissors,
        player2Move: MinRpsMove.Rock,
        result: MinRpsResult.Player2,
      };
      mockRepository.play.and.returnValue(Promise.resolve(mockResult));

      await service.playGame(MinRpsMove.Scissors);

      const game = service.game();
      expect(game.player1Move).toBe(MinRpsMove.Scissors);
      expect(game.player2Move).toBe(MinRpsMove.Rock);
      expect(game.result).toBe(MinRpsResult.Player2);
    });
  });
});
