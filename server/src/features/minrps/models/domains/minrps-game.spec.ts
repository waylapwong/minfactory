import { MinRpsGame } from './minrps-game';
import { MinRpsPlayer } from './minrps-player';
import { MinRpsMove } from '../enums/minrps-move.enum';
import { MinRpsResult } from '../enums/minrps-game-result.enum';
import { GameRuleException } from 'src/shared/exceptions/game-rule.exception';

describe('MinRpsGame', () => {
  let game: MinRpsGame;

  beforeEach(() => {
    game = new MinRpsGame();
  });

  it('should create with default values', () => {
    expect(game.id).toBeDefined();
    expect(game.name).toBe('');
    expect(game.observerCount).toBe(0);
    expect(game.createdAt).toBeInstanceOf(Date);
    expect(game.player1).toBeInstanceOf(MinRpsPlayer);
    expect(game.player2).toBeInstanceOf(MinRpsPlayer);
  });

  describe('addObserver', () => {
    it('should increment observer count', () => {
      expect(game.observerCount).toBe(0);

      game.addObserver();
      expect(game.observerCount).toBe(1);

      game.addObserver();
      expect(game.observerCount).toBe(2);
    });
  });

  describe('setPlayer1', () => {
    it('should set player1', () => {
      const player = new MinRpsPlayer();
      player.name = 'test-player-name';

      game.setPlayer1(player);

      expect(game.player1).toBe(player);
      expect(game.player1.name).toBe('test-player-name');
    });
  });

  describe('setPlayer2', () => {
    it('should set player2', () => {
      const player = new MinRpsPlayer();
      player.name = 'test-player-name';

      game.setPlayer2(player);

      expect(game.player2).toBe(player);
      expect(game.player2.name).toBe('test-player-name');
    });
  });

  describe('setPlayer1Move', () => {
    it('should set player1 move when player1 exists', () => {
      game.setPlayer1(new MinRpsPlayer());
      game.setPlayer1Move(MinRpsMove.Rock);

      expect(game.player1.move).toBe(MinRpsMove.Rock);
    });

    it('should handle setting move when player1 exists', () => {
      game.setPlayer1(new MinRpsPlayer());
      game.setPlayer1Move(MinRpsMove.Paper);

      expect(game.player1.move).toBe(MinRpsMove.Paper);
    });
  });

  describe('setPlayer2Move', () => {
    it('should set player2 move when player2 exists', () => {
      game.setPlayer2(new MinRpsPlayer());
      game.setPlayer2Move(MinRpsMove.Scissors);

      expect(game.player2.move).toBe(MinRpsMove.Scissors);
    });

    it('should handle setting move when player2 exists', () => {
      game.setPlayer2(new MinRpsPlayer());
      game.setPlayer2Move(MinRpsMove.Rock);

      expect(game.player2.move).toBe(MinRpsMove.Rock);
    });
  });

  describe('getResult', () => {
    beforeEach(() => {
      game.setPlayer1(new MinRpsPlayer());
      game.setPlayer2(new MinRpsPlayer());
    });

    it('should return Draw when both players choose Rock', () => {
      game.setPlayer1Move(MinRpsMove.Rock);
      game.setPlayer2Move(MinRpsMove.Rock);

      expect(game.getResult()).toBe(MinRpsResult.Draw);
    });

    it('should return Draw when both players choose Paper', () => {
      game.setPlayer1Move(MinRpsMove.Paper);
      game.setPlayer2Move(MinRpsMove.Paper);

      expect(game.getResult()).toBe(MinRpsResult.Draw);
    });

    it('should return Draw when both players choose Scissors', () => {
      game.setPlayer1Move(MinRpsMove.Scissors);
      game.setPlayer2Move(MinRpsMove.Scissors);

      expect(game.getResult()).toBe(MinRpsResult.Draw);
    });

    it('should return Player1 when Paper beats Rock', () => {
      game.setPlayer1Move(MinRpsMove.Paper);
      game.setPlayer2Move(MinRpsMove.Rock);

      expect(game.getResult()).toBe(MinRpsResult.Player1);
    });

    it('should return Player1 when Rock beats Scissors', () => {
      game.setPlayer1Move(MinRpsMove.Rock);
      game.setPlayer2Move(MinRpsMove.Scissors);

      expect(game.getResult()).toBe(MinRpsResult.Player1);
    });

    it('should return Player1 when Scissors beats Paper', () => {
      game.setPlayer1Move(MinRpsMove.Scissors);
      game.setPlayer2Move(MinRpsMove.Paper);

      expect(game.getResult()).toBe(MinRpsResult.Player1);
    });

    it('should return Player2 when Rock beats Paper', () => {
      game.setPlayer1Move(MinRpsMove.Paper);
      game.setPlayer2Move(MinRpsMove.Scissors);

      expect(game.getResult()).toBe(MinRpsResult.Player2);
    });

    it('should return Player2 when Scissors beats Rock', () => {
      game.setPlayer1Move(MinRpsMove.Scissors);
      game.setPlayer2Move(MinRpsMove.Rock);

      expect(game.getResult()).toBe(MinRpsResult.Player2);
    });

    it('should return Player2 when Paper beats Scissors', () => {
      game.setPlayer1Move(MinRpsMove.Rock);
      game.setPlayer2Move(MinRpsMove.Paper);

      expect(game.getResult()).toBe(MinRpsResult.Player2);
    });

    it('should throw GameRuleException when player1 move is None', () => {
      game.setPlayer1Move(MinRpsMove.None);
      game.setPlayer2Move(MinRpsMove.Rock);

      expect(() => game.getResult()).toThrow(GameRuleException);
      expect(() => game.getResult()).toThrow('Player moves cannot be none.');
    });

    it('should throw GameRuleException when player2 move is None', () => {
      game.setPlayer1Move(MinRpsMove.Rock);
      game.setPlayer2Move(MinRpsMove.None);

      expect(() => game.getResult()).toThrow(GameRuleException);
      expect(() => game.getResult()).toThrow('Player moves cannot be none.');
    });

    it('should throw GameRuleException when both moves are None', () => {
      game.setPlayer1Move(MinRpsMove.None);
      game.setPlayer2Move(MinRpsMove.None);

      expect(() => game.getResult()).toThrow(GameRuleException);
      expect(() => game.getResult()).toThrow('Player moves cannot be none.');
    });
  });

  describe('edge cases', () => {
    it('should handle creating multiple games with unique ids', () => {
      const game1 = new MinRpsGame();
      const game2 = new MinRpsGame();

      expect(game1.id).not.toBe(game2.id);
    });
  });
});
