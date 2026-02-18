import { MinRpsMove, MinRpsResult } from '../../../../core/generated';
import { MinRpsGame } from './minrps-game';

describe('MinRpsGame', () => {
  describe('constructor', () => {
    it('should create instance with default values', () => {
      const game = new MinRpsGame();
      expect(game).toBeTruthy();
      expect(game.player1Move).toBe(MinRpsMove.None);
      expect(game.player2Move).toBe(MinRpsMove.None);
      expect(game.player1SelectedMove).toBe(MinRpsMove.None);
      expect(game.player2SelectedMove).toBe(MinRpsMove.None);
      expect(game.result).toBe(MinRpsResult.None);
      expect(game.id).toBe('');
      expect(game.name).toBe('');
      expect(game.observerCount).toBe(0);
      expect(game.playerCount).toBe(0);
      expect(game.createdAt).toBeInstanceOf(Date);
    });

    it('should create instance with custom values', () => {
      const customDate = new Date('2024-01-01');
      const game = new MinRpsGame({
        id: 'game-123',
        name: 'Test Game',
        player1Move: MinRpsMove.Rock,
        player2Move: MinRpsMove.Scissors,
        player1SelectedMove: MinRpsMove.Paper,
        player2SelectedMove: MinRpsMove.Rock,
        result: MinRpsResult.Player1,
        observerCount: 5,
        playerCount: 2,
        createdAt: customDate,
      });
      expect(game.id).toBe('game-123');
      expect(game.name).toBe('Test Game');
      expect(game.player1Move).toBe(MinRpsMove.Rock);
      expect(game.player2Move).toBe(MinRpsMove.Scissors);
      expect(game.player1SelectedMove).toBe(MinRpsMove.Paper);
      expect(game.player2SelectedMove).toBe(MinRpsMove.Rock);
      expect(game.result).toBe(MinRpsResult.Player1);
      expect(game.observerCount).toBe(5);
      expect(game.playerCount).toBe(2);
      expect(game.createdAt).toBe(customDate);
    });

    it('should create instance with partial values', () => {
      const game = new MinRpsGame({
        player1Move: MinRpsMove.Rock,
        name: 'Partial Game',
      });
      expect(game.player1Move).toBe(MinRpsMove.Rock);
      expect(game.name).toBe('Partial Game');
      expect(game.player2Move).toBe(MinRpsMove.None);
      expect(game.result).toBe(MinRpsResult.None);
    });
  });

  describe('setPlayer1Move()', () => {
    it('should set player 1 move to Rock', () => {
      const game = new MinRpsGame();
      game.setPlayer1Move(MinRpsMove.Rock);
      expect(game.player1Move).toBe(MinRpsMove.Rock);
    });

    it('should set player 1 move to Paper', () => {
      const game = new MinRpsGame();
      game.setPlayer1Move(MinRpsMove.Paper);
      expect(game.player1Move).toBe(MinRpsMove.Paper);
    });

    it('should set player 1 move to Scissors', () => {
      const game = new MinRpsGame();
      game.setPlayer1Move(MinRpsMove.Scissors);
      expect(game.player1Move).toBe(MinRpsMove.Scissors);
    });

    it('should set player 1 move to None', () => {
      const game = new MinRpsGame({ player1Move: MinRpsMove.Rock });
      game.setPlayer1Move(MinRpsMove.None);
      expect(game.player1Move).toBe(MinRpsMove.None);
    });

    it('should override existing player 1 move', () => {
      const game = new MinRpsGame({ player1Move: MinRpsMove.Rock });
      game.setPlayer1Move(MinRpsMove.Paper);
      expect(game.player1Move).toBe(MinRpsMove.Paper);
    });
  });

  describe('setPlayer2Move()', () => {
    it('should set player 2 move to Rock', () => {
      const game = new MinRpsGame();
      game.setPlayer2Move(MinRpsMove.Rock);
      expect(game.player2Move).toBe(MinRpsMove.Rock);
    });

    it('should set player 2 move to Paper', () => {
      const game = new MinRpsGame();
      game.setPlayer2Move(MinRpsMove.Paper);
      expect(game.player2Move).toBe(MinRpsMove.Paper);
    });

    it('should set player 2 move to Scissors', () => {
      const game = new MinRpsGame();
      game.setPlayer2Move(MinRpsMove.Scissors);
      expect(game.player2Move).toBe(MinRpsMove.Scissors);
    });

    it('should set player 2 move to None', () => {
      const game = new MinRpsGame({ player2Move: MinRpsMove.Scissors });
      game.setPlayer2Move(MinRpsMove.None);
      expect(game.player2Move).toBe(MinRpsMove.None);
    });

    it('should override existing player 2 move', () => {
      const game = new MinRpsGame({ player2Move: MinRpsMove.Paper });
      game.setPlayer2Move(MinRpsMove.Scissors);
      expect(game.player2Move).toBe(MinRpsMove.Scissors);
    });
  });

  describe('setPlayer1SelectedMove()', () => {
    it('should set player 1 selected move to Rock', () => {
      const game = new MinRpsGame();
      game.setPlayer1SelectedMove(MinRpsMove.Rock);
      expect(game.player1SelectedMove).toBe(MinRpsMove.Rock);
    });

    it('should set player 1 selected move to Paper', () => {
      const game = new MinRpsGame();
      game.setPlayer1SelectedMove(MinRpsMove.Paper);
      expect(game.player1SelectedMove).toBe(MinRpsMove.Paper);
    });

    it('should set player 1 selected move to Scissors', () => {
      const game = new MinRpsGame();
      game.setPlayer1SelectedMove(MinRpsMove.Scissors);
      expect(game.player1SelectedMove).toBe(MinRpsMove.Scissors);
    });

    it('should override existing player 1 selected move', () => {
      const game = new MinRpsGame({ player1SelectedMove: MinRpsMove.Rock });
      game.setPlayer1SelectedMove(MinRpsMove.Paper);
      expect(game.player1SelectedMove).toBe(MinRpsMove.Paper);
    });
  });

  describe('setPlayer2SelectedMove()', () => {
    it('should set player 2 selected move to Rock', () => {
      const game = new MinRpsGame();
      game.setPlayer2SelectedMove(MinRpsMove.Rock);
      expect(game.player2SelectedMove).toBe(MinRpsMove.Rock);
    });

    it('should set player 2 selected move to Paper', () => {
      const game = new MinRpsGame();
      game.setPlayer2SelectedMove(MinRpsMove.Paper);
      expect(game.player2SelectedMove).toBe(MinRpsMove.Paper);
    });

    it('should set player 2 selected move to Scissors', () => {
      const game = new MinRpsGame();
      game.setPlayer2SelectedMove(MinRpsMove.Scissors);
      expect(game.player2SelectedMove).toBe(MinRpsMove.Scissors);
    });

    it('should override existing player 2 selected move', () => {
      const game = new MinRpsGame({ player2SelectedMove: MinRpsMove.Rock });
      game.setPlayer2SelectedMove(MinRpsMove.Scissors);
      expect(game.player2SelectedMove).toBe(MinRpsMove.Scissors);
    });
  });

  describe('property independence', () => {
    it('should allow setting different moves for each player', () => {
      const game = new MinRpsGame();
      game.setPlayer1Move(MinRpsMove.Rock);
      game.setPlayer2Move(MinRpsMove.Paper);
      game.setPlayer1SelectedMove(MinRpsMove.Scissors);
      game.setPlayer2SelectedMove(MinRpsMove.Rock);

      expect(game.player1Move).toBe(MinRpsMove.Rock);
      expect(game.player2Move).toBe(MinRpsMove.Paper);
      expect(game.player1SelectedMove).toBe(MinRpsMove.Scissors);
      expect(game.player2SelectedMove).toBe(MinRpsMove.Rock);
    });
  });
});
