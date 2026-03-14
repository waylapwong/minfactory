import { MinRpsResult } from '../enums/minrps-game-result.enum';
import { MinRpsMove } from '../enums/minrps-move.enum';
import { MinRpsGame } from './minrps-game';
import { MinRpsPlayer } from './minrps-player';
import { GameRuleException } from 'src/shared/exceptions/game-rule.exception';

describe('MinRpsGame', () => {
  let game: MinRpsGame;

  beforeEach(() => {
    game = new MinRpsGame();
  });

  it('should create with default values', () => {
    expect(game.id).toBeDefined();
    expect(game.name).toBe('');
    expect(game.observers).toBeInstanceOf(Map);
    expect(game.observers.size).toBe(0);
    expect(game.createdAt).toBeInstanceOf(Date);
    expect(game.player1).toBeInstanceOf(MinRpsPlayer);
    expect(game.player2).toBeInstanceOf(MinRpsPlayer);
    expect(game.player1.id).toBe('');
    expect(game.player2.id).toBe('');
  });

  describe('addObserver', () => {
    it('should add observer to the map', () => {
      expect(game.observers.size).toBe(0);

      game.addObserver('observer-1');
      expect(game.observers.size).toBe(1);
      expect(game.observers.has('observer-1')).toBe(true);

      game.addObserver('observer-2');
      expect(game.observers.size).toBe(2);
      expect(game.observers.has('observer-2')).toBe(true);
    });

    it('should create MinRpsPlayer for observer with correct id', () => {
      game.addObserver('test-observer-id');

      const observer = game.observers.get('test-observer-id');
      expect(observer).toBeInstanceOf(MinRpsPlayer);
      expect(observer?.id).toBe('test-observer-id');
    });
  });

  describe('removeObserver', () => {
    it('should remove observer from the map', () => {
      game.addObserver('observer-1');
      game.addObserver('observer-2');
      expect(game.observers.size).toBe(2);

      game.removeObserver('observer-1');
      expect(game.observers.size).toBe(1);
      expect(game.observers.has('observer-1')).toBe(false);
      expect(game.observers.has('observer-2')).toBe(true);
    });
  });

  describe('isObserver', () => {
    it('should return true if observer exists', () => {
      game.addObserver('observer-1');
      expect(game.isObserver('observer-1')).toBe(true);
    });

    it('should return false if observer does not exist', () => {
      expect(game.isObserver('non-existent')).toBe(false);
    });
  });

  describe('setPlayer1', () => {
    it('should set player1', () => {
      const player = new MinRpsPlayer();
      player.id = 'player-1-id';
      player.name = 'test-player-name';

      game.setPlayer1(player);

      expect(game.player1).toBe(player);
      expect(game.player1.id).toBe('player-1-id');
      expect(game.player1.name).toBe('test-player-name');
    });
  });

  describe('setPlayer2', () => {
    it('should set player2', () => {
      const player = new MinRpsPlayer();
      player.id = 'player-2-id';
      player.name = 'test-player-name';

      game.setPlayer2(player);

      expect(game.player2).toBe(player);
      expect(game.player2.id).toBe('player-2-id');
      expect(game.player2.name).toBe('test-player-name');
    });
  });

  describe('isPlayer1', () => {
    it('should return true if player id matches player1', () => {
      const player = new MinRpsPlayer();
      player.id = 'player-1-id';
      game.setPlayer1(player);

      expect(game.isPlayer1('player-1-id')).toBe(true);
    });

    it('should return false if player id does not match player1', () => {
      expect(game.isPlayer1('wrong-id')).toBe(false);
    });
  });

  describe('isPlayer2', () => {
    it('should return true if player id matches player2', () => {
      const player = new MinRpsPlayer();
      player.id = 'player-2-id';
      game.setPlayer2(player);

      expect(game.isPlayer2('player-2-id')).toBe(true);
    });

    it('should return false if player id does not match player2', () => {
      expect(game.isPlayer2('wrong-id')).toBe(false);
    });
  });

  describe('seatPlayer', () => {
    it('should seat player in player1 slot if empty', () => {
      const player = new MinRpsPlayer();
      player.id = 'new-player-id';
      player.name = 'New Player';

      game.seatPlayer(player, 1);

      expect(game.player1).toBe(player);
      expect(game.player2.id).toBe('');
    });

    it('should seat player in player2 slot if player1 is occupied', () => {
      const player1 = new MinRpsPlayer();
      player1.id = 'player-1-id';
      game.setPlayer1(player1);

      const player2 = new MinRpsPlayer();
      player2.id = 'player-2-id';
      player2.name = 'Player 2';

      game.seatPlayer(player2, 2);

      expect(game.player1.id).toBe('player-1-id');
      expect(game.player2).toBe(player2);
    });

    it('should throw GameRuleException if both seats are occupied', () => {
      const player1 = new MinRpsPlayer();
      player1.id = 'player-1-id';
      game.setPlayer1(player1);

      const player2 = new MinRpsPlayer();
      player2.id = 'player-2-id';
      game.setPlayer2(player2);

      const player3 = new MinRpsPlayer();
      player3.id = 'player-3-id';

      expect(() => game.seatPlayer(player3, 1)).toThrow(GameRuleException);
      expect(() => game.seatPlayer(player3, 1)).toThrow('Player 1 seat is already occupied');
    });
  });

  describe('removePlayer1', () => {
    it('should remove player1 and reset to empty player', () => {
      const player = new MinRpsPlayer();
      player.id = 'player-1-id';
      game.setPlayer1(player);

      game.removePlayer1();

      expect(game.player1).toBeInstanceOf(MinRpsPlayer);
      expect(game.player1.id).toBe('');
    });

    it('should clear result history when player1 is removed', () => {
      const player1 = new MinRpsPlayer();
      player1.id = 'player-1-id';
      game.setPlayer1(player1);
      game.appendResultToHistory(MinRpsResult.Player1);
      game.appendResultToHistory(MinRpsResult.Draw);

      game.removePlayer1();

      expect(game.resultHistory).toEqual([]);
    });

    it('should reset all player moves when player1 is removed', () => {
      const player1 = new MinRpsPlayer();
      player1.id = 'player-1-id';
      game.setPlayer1(player1);
      game.setPlayer1Move(MinRpsMove.Rock);

      const player2 = new MinRpsPlayer();
      player2.id = 'player-2-id';
      game.setPlayer2(player2);
      game.setPlayer2Move(MinRpsMove.Paper);

      game.removePlayer1();

      expect(game.player1.move).toBe(MinRpsMove.None);
      expect(game.player2.move).toBe(MinRpsMove.None);
    });
  });

  describe('removePlayer2', () => {
    it('should remove player2 and reset to empty player', () => {
      const player = new MinRpsPlayer();
      player.id = 'player-2-id';
      game.setPlayer2(player);

      game.removePlayer2();

      expect(game.player2).toBeInstanceOf(MinRpsPlayer);
      expect(game.player2.id).toBe('');
    });

    it('should clear result history when player2 is removed', () => {
      const player2 = new MinRpsPlayer();
      player2.id = 'player-2-id';
      game.setPlayer2(player2);
      game.appendResultToHistory(MinRpsResult.Player2);
      game.appendResultToHistory(MinRpsResult.Draw);

      game.removePlayer2();

      expect(game.resultHistory).toEqual([]);
    });

    it('should reset all player moves when player2 is removed', () => {
      const player1 = new MinRpsPlayer();
      player1.id = 'player-1-id';
      game.setPlayer1(player1);
      game.setPlayer1Move(MinRpsMove.Rock);

      const player2 = new MinRpsPlayer();
      player2.id = 'player-2-id';
      game.setPlayer2(player2);
      game.setPlayer2Move(MinRpsMove.Paper);

      game.removePlayer2();

      expect(game.player1.move).toBe(MinRpsMove.None);
      expect(game.player2.move).toBe(MinRpsMove.None);
    });
  });

  describe('removePlayer', () => {
    it('should remove player1 if playerId matches player1', () => {
      const player = new MinRpsPlayer();
      player.id = 'player-1-id';
      game.setPlayer1(player);

      game.removePlayer('player-1-id');

      expect(game.player1.id).toBe('');
    });

    it('should remove player2 if playerId matches player2', () => {
      const player = new MinRpsPlayer();
      player.id = 'player-2-id';
      game.setPlayer2(player);

      game.removePlayer('player-2-id');

      expect(game.player2.id).toBe('');
    });

    it('should remove observer if playerId matches observer', () => {
      game.addObserver('observer-id');

      game.removePlayer('observer-id');

      expect(game.observers.has('observer-id')).toBe(false);
    });

    it('should do nothing if playerId does not match any player or observer', () => {
      const player1 = new MinRpsPlayer();
      player1.id = 'player-1-id';
      game.setPlayer1(player1);

      game.removePlayer('non-existent-id');

      expect(game.player1.id).toBe('player-1-id');
    });
  });

  describe('setPlayer1Move', () => {
    it('should set player1 move when player1 exists', () => {
      const player = new MinRpsPlayer();
      player.id = 'player-1-id';
      game.setPlayer1(player);

      game.setPlayer1Move(MinRpsMove.Rock);

      expect(game.player1.move).toBe(MinRpsMove.Rock);
    });

    it('should set different moves for player1', () => {
      const player = new MinRpsPlayer();
      player.id = 'player-1-id';
      game.setPlayer1(player);

      game.setPlayer1Move(MinRpsMove.Paper);
      expect(game.player1.move).toBe(MinRpsMove.Paper);

      game.setPlayer1Move(MinRpsMove.Scissors);
      expect(game.player1.move).toBe(MinRpsMove.Scissors);
    });
  });

  describe('setPlayer2Move', () => {
    it('should set player2 move when player2 exists', () => {
      const player = new MinRpsPlayer();
      player.id = 'player-2-id';
      game.setPlayer2(player);

      game.setPlayer2Move(MinRpsMove.Scissors);

      expect(game.player2.move).toBe(MinRpsMove.Scissors);
    });

    it('should set different moves for player2', () => {
      const player = new MinRpsPlayer();
      player.id = 'player-2-id';
      game.setPlayer2(player);

      game.setPlayer2Move(MinRpsMove.Rock);
      expect(game.player2.move).toBe(MinRpsMove.Rock);

      game.setPlayer2Move(MinRpsMove.Paper);
      expect(game.player2.move).toBe(MinRpsMove.Paper);
    });
  });

  describe('resetPlayer1Move', () => {
    it('should reset player1 move to None', () => {
      const player = new MinRpsPlayer();
      player.id = 'player-1-id';
      game.setPlayer1(player);
      game.setPlayer1Move(MinRpsMove.Rock);

      game.resetPlayer1Move();

      expect(game.player1.move).toBe(MinRpsMove.None);
    });
  });

  describe('resetPlayer2Move', () => {
    it('should reset player2 move to None', () => {
      const player = new MinRpsPlayer();
      player.id = 'player-2-id';
      game.setPlayer2(player);
      game.setPlayer2Move(MinRpsMove.Paper);

      game.resetPlayer2Move();

      expect(game.player2.move).toBe(MinRpsMove.None);
    });
  });

  describe('resetPlayerMoves', () => {
    it('should reset both player moves to None', () => {
      const player1 = new MinRpsPlayer();
      player1.id = 'player-1-id';
      game.setPlayer1(player1);
      game.setPlayer1Move(MinRpsMove.Rock);

      const player2 = new MinRpsPlayer();
      player2.id = 'player-2-id';
      game.setPlayer2(player2);
      game.setPlayer2Move(MinRpsMove.Scissors);

      game.resetPlayerMoves();

      expect(game.player1.move).toBe(MinRpsMove.None);
      expect(game.player2.move).toBe(MinRpsMove.None);
    });
  });

  describe('isGameReady', () => {
    it('should return false when players are not seated', () => {
      expect(game.isGameReady()).toBe(false);
    });

    it('should return false when only player1 is seated', () => {
      const player1 = new MinRpsPlayer();
      player1.id = 'player-1-id';
      game.setPlayer1(player1);

      expect(game.isGameReady()).toBe(false);
    });

    it('should return false when players are seated but no moves selected', () => {
      const player1 = new MinRpsPlayer();
      player1.id = 'player-1-id';
      game.setPlayer1(player1);

      const player2 = new MinRpsPlayer();
      player2.id = 'player-2-id';
      game.setPlayer2(player2);

      expect(game.isGameReady()).toBe(false);
    });

    it('should return false when only one player has selected a move', () => {
      const player1 = new MinRpsPlayer();
      player1.id = 'player-1-id';
      game.setPlayer1(player1);
      game.setPlayer1Move(MinRpsMove.Rock);

      const player2 = new MinRpsPlayer();
      player2.id = 'player-2-id';
      game.setPlayer2(player2);

      expect(game.isGameReady()).toBe(false);
    });

    it('should return true when both players are seated and have selected moves', () => {
      const player1 = new MinRpsPlayer();
      player1.id = 'player-1-id';
      game.setPlayer1(player1);
      game.setPlayer1Move(MinRpsMove.Rock);

      const player2 = new MinRpsPlayer();
      player2.id = 'player-2-id';
      game.setPlayer2(player2);
      game.setPlayer2Move(MinRpsMove.Paper);

      expect(game.isGameReady()).toBe(true);
    });
  });

  describe('getResult', () => {
    beforeEach(() => {
      const player1 = new MinRpsPlayer();
      player1.id = 'player-1-id';
      game.setPlayer1(player1);

      const player2 = new MinRpsPlayer();
      player2.id = 'player-2-id';
      game.setPlayer2(player2);
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

    it('should return Player2 when Paper beats Rock', () => {
      game.setPlayer1Move(MinRpsMove.Rock);
      game.setPlayer2Move(MinRpsMove.Paper);

      expect(game.getResult()).toBe(MinRpsResult.Player2);
    });

    it('should return Player2 when Scissors beats Paper', () => {
      game.setPlayer1Move(MinRpsMove.Paper);
      game.setPlayer2Move(MinRpsMove.Scissors);

      expect(game.getResult()).toBe(MinRpsResult.Player2);
    });

    it('should return Player2 when Rock beats Scissors', () => {
      game.setPlayer1Move(MinRpsMove.Scissors);
      game.setPlayer2Move(MinRpsMove.Rock);

      expect(game.getResult()).toBe(MinRpsResult.Player2);
    });

    it('should throw GameRuleException when player1 is not seated', () => {
      game.removePlayer1();
      const player2 = new MinRpsPlayer();
      player2.id = 'player-2-id';
      game.setPlayer2(player2);
      game.setPlayer2Move(MinRpsMove.Rock);

      expect(() => game.getResult()).toThrow(GameRuleException);
      expect(() => game.getResult()).toThrow('Both players must be seated to determine the result');
    });

    it('should throw GameRuleException when player2 is not seated', () => {
      game.removePlayer2();
      game.setPlayer1Move(MinRpsMove.Rock);

      expect(() => game.getResult()).toThrow(GameRuleException);
      expect(() => game.getResult()).toThrow('Both players must be seated to determine the result');
    });

    it('should throw GameRuleException when player1 move is None', () => {
      game.setPlayer1Move(MinRpsMove.None);
      game.setPlayer2Move(MinRpsMove.Rock);

      expect(() => game.getResult()).toThrow(GameRuleException);
      expect(() => game.getResult()).toThrow('Player must select a move');
    });

    it('should throw GameRuleException when player2 move is None', () => {
      game.setPlayer1Move(MinRpsMove.Rock);
      game.setPlayer2Move(MinRpsMove.None);

      expect(() => game.getResult()).toThrow(GameRuleException);
      expect(() => game.getResult()).toThrow('Player must select a move');
    });

    it('should throw GameRuleException when both moves are None', () => {
      game.setPlayer1Move(MinRpsMove.None);
      game.setPlayer2Move(MinRpsMove.None);

      expect(() => game.getResult()).toThrow(GameRuleException);
      expect(() => game.getResult()).toThrow('Player must select a move');
    });
  });

  describe('edge cases', () => {
    it('should handle creating multiple games with unique ids', () => {
      const game1 = new MinRpsGame();
      const game2 = new MinRpsGame();

      expect(game1.id).not.toBe(game2.id);
    });

    it('should maintain separate observer maps for different games', () => {
      const game1 = new MinRpsGame();
      const game2 = new MinRpsGame();

      game1.addObserver('observer-1');
      game2.addObserver('observer-2');

      expect(game1.observers.has('observer-1')).toBe(true);
      expect(game1.observers.has('observer-2')).toBe(false);
      expect(game2.observers.has('observer-1')).toBe(false);
      expect(game2.observers.has('observer-2')).toBe(true);
    });

    it('should append result to history', () => {
      game.appendResultToHistory(MinRpsResult.Player1);
      game.appendResultToHistory(MinRpsResult.Draw);

      expect(game.resultHistory).toEqual([MinRpsResult.Player1, MinRpsResult.Draw]);
    });

    it('should ignore None result in history', () => {
      game.appendResultToHistory(MinRpsResult.None);

      expect(game.resultHistory).toEqual([]);
    });

    it('should keep only the last 10 history entries', () => {
      for (let i = 0; i < 11; i++) {
        game.appendResultToHistory(i % 2 === 0 ? MinRpsResult.Player1 : MinRpsResult.Player2);
      }

      expect(game.resultHistory.length).toBe(10);
      expect(game.resultHistory[0]).toBe(MinRpsResult.Player2);
    });
  });
});
