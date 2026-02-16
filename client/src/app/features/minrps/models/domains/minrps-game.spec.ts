import { MinRpsMove, MinRpsResult } from '../../../../core/generated';
import { MinRpsGame } from './minrps-game';

describe('MinRpsGame', () => {
  describe('constructor', () => {
    it('should create instance with default values', () => {
      const game = new MinRpsGame();
      expect(game).toBeTruthy();
      expect(game.player1Move).toBe(MinRpsMove.None);
      expect(game.player2Move).toBe(MinRpsMove.None);
      expect(game.result).toBe(MinRpsResult.None);
    });

    it('should create instance with custom values', () => {
      const game = new MinRpsGame({
        player1Move: MinRpsMove.Rock,
        player2Move: MinRpsMove.Scissors,
        result: MinRpsResult.Player1,
      });
      expect(game.player1Move).toBe(MinRpsMove.Rock);
      expect(game.player2Move).toBe(MinRpsMove.Scissors);
      expect(game.result).toBe(MinRpsResult.Player1);
    });
  });

  describe('setPlayer1Move()', () => {
    it('should set player 1 move', () => {
      const game = new MinRpsGame();
      game.setPlayer1Move(MinRpsMove.Rock);
      expect(game.player1Move).toBe(MinRpsMove.Rock);
    });
  });

  describe('setPlayer2Move()', () => {
    it('should set player 2 move', () => {
      const game = new MinRpsGame();
      game.setPlayer2Move(MinRpsMove.Paper);
      expect(game.player2Move).toBe(MinRpsMove.Paper);
    });
  });

  describe('setPlayer1SelectedMove()', () => {
    it('should set player 1 selected move', () => {
      const game = new MinRpsGame();
      game.setPlayer1SelectedMove(MinRpsMove.Scissors);
      expect(game.player1SelectedMove).toBe(MinRpsMove.Scissors);
    });
  });

  describe('setPlayer2SelectedMove()', () => {
    it('should set player 2 selected move', () => {
      const game = new MinRpsGame();
      game.setPlayer2SelectedMove(MinRpsMove.Rock);
      expect(game.player2SelectedMove).toBe(MinRpsMove.Rock);
    });
  });
});
