import { MinRpsMove, MinRpsResult } from '../../../../core/generated';
import { MinRpsGame } from './minrps-game';
import { MinRpsPlayer } from './minrps-player';

describe('MinRpsGame', () => {
  describe('constructor', () => {
    it('should create instance with default values', () => {
      const game = new MinRpsGame();
      expect(game).toBeTruthy();
      expect(game.player1.move).toBe(MinRpsMove.None);
      expect(game.player2.move).toBe(MinRpsMove.None);
      expect(game.player1.selectedMove).toBe(MinRpsMove.None);
      expect(game.player2.selectedMove).toBe(MinRpsMove.None);
      expect(game.result).toBe(MinRpsResult.None);
      expect(game.id).toBe('');
      expect(game.name).toBe('');
      expect(game.observerCount).toBe(0);
      expect(game.playerCount).toBe(0);
      expect(game.createdAt).toBeInstanceOf(Date);
    });

    it('should create instance with custom values', () => {
      const customDate = new Date('2024-01-01');
      const observers = new Map<string, MinRpsPlayer>();
      for (let i = 0; i < 5; i++) observers.set(`obs-${i}`, new MinRpsPlayer());
      const game = new MinRpsGame({
        id: 'game-123',
        name: 'Test Game',
        player1: new MinRpsPlayer({ move: MinRpsMove.Rock, selectedMove: MinRpsMove.Paper }),
        player2: new MinRpsPlayer({ move: MinRpsMove.Scissors, selectedMove: MinRpsMove.Rock }),
        result: MinRpsResult.Player1,
        observers,
        playerCount: 2,
        createdAt: customDate,
      });
      expect(game.id).toBe('game-123');
      expect(game.name).toBe('Test Game');
      expect(game.player1.move).toBe(MinRpsMove.Rock);
      expect(game.player2.move).toBe(MinRpsMove.Scissors);
      expect(game.player1.selectedMove).toBe(MinRpsMove.Paper);
      expect(game.player2.selectedMove).toBe(MinRpsMove.Rock);
      expect(game.result).toBe(MinRpsResult.Player1);
      expect(game.observerCount).toBe(5);
      expect(game.playerCount).toBe(2);
      expect(game.createdAt).toBe(customDate);
    });

    it('should create instance with partial values', () => {
      const game = new MinRpsGame({
        player1: new MinRpsPlayer({ move: MinRpsMove.Rock }),
        name: 'Partial Game',
      });
      expect(game.player1.move).toBe(MinRpsMove.Rock);
      expect(game.name).toBe('Partial Game');
      expect(game.player2.move).toBe(MinRpsMove.None);
      expect(game.result).toBe(MinRpsResult.None);
    });
  });

  describe('direct player property access', () => {
    it('should allow setting player 1 move directly', () => {
      const game = new MinRpsGame();
      game.player1.move = MinRpsMove.Rock;
      expect(game.player1.move).toBe(MinRpsMove.Rock);
    });

    it('should allow setting player 2 move directly', () => {
      const game = new MinRpsGame();
      game.player2.move = MinRpsMove.Paper;
      expect(game.player2.move).toBe(MinRpsMove.Paper);
    });

    it('should allow setting player 1 selected move directly', () => {
      const game = new MinRpsGame();
      game.player1.selectedMove = MinRpsMove.Scissors;
      expect(game.player1.selectedMove).toBe(MinRpsMove.Scissors);
    });

    it('should allow setting player 2 selected move directly', () => {
      const game = new MinRpsGame();
      game.player2.selectedMove = MinRpsMove.Rock;
      expect(game.player2.selectedMove).toBe(MinRpsMove.Rock);
    });

    it('should allow setting different moves for each player', () => {
      const game = new MinRpsGame();
      game.player1.move = MinRpsMove.Rock;
      game.player2.move = MinRpsMove.Paper;
      game.player1.selectedMove = MinRpsMove.Scissors;
      game.player2.selectedMove = MinRpsMove.Rock;

      expect(game.player1.move).toBe(MinRpsMove.Rock);
      expect(game.player2.move).toBe(MinRpsMove.Paper);
      expect(game.player1.selectedMove).toBe(MinRpsMove.Scissors);
      expect(game.player2.selectedMove).toBe(MinRpsMove.Rock);
    });
  });
});
