import { MinRpsMove } from '../enums/minrps-move.enum';
import { MinRpsResult } from '../enums/minrps-result.enum';
import { MinRpsGame } from './minrps-game';

describe('result()', () => {
  it('should return "none", if player 1 has no move', () => {
    const game = new MinRpsGame({ player1Move: MinRpsMove.None, player2Move: MinRpsMove.Rock });
    expect(game.result).toBe(MinRpsResult.None);
  });

  it('should return "none", if player 2 has no move', () => {
    const game = new MinRpsGame({ player1Move: MinRpsMove.Rock, player2Move: MinRpsMove.None });
    expect(game.result).toBe(MinRpsResult.None);
  });

  it('should return "draw", if both players have same moves', () => {
    const game = new MinRpsGame({ player1Move: MinRpsMove.Rock, player2Move: MinRpsMove.Rock });
    expect(game.result).toBe(MinRpsResult.Draw);
  });

  it('should return "player1", if player 1 rock & player 2 scissors', () => {
    const game = new MinRpsGame({ player1Move: MinRpsMove.Rock, player2Move: MinRpsMove.Scissors });
    expect(game.result).toBe(MinRpsResult.Player1);
  });

  it('should return "player1", if player 1 scissors & player 2 paper', () => {
    const game = new MinRpsGame({
      player1Move: MinRpsMove.Scissors,
      player2Move: MinRpsMove.Paper,
    });
    expect(game.result).toBe(MinRpsResult.Player1);
  });

  it('should return "player1", if player 1 paper & player 2 rock', () => {
    const game = new MinRpsGame({ player1Move: MinRpsMove.Paper, player2Move: MinRpsMove.Rock });
    expect(game.result).toBe(MinRpsResult.Player1);
  });

  it('should return "player2", if player 1 scissors & player 2 rock', () => {
    const game = new MinRpsGame({ player1Move: MinRpsMove.Scissors, player2Move: MinRpsMove.Rock });
    expect(game.result).toBe(MinRpsResult.Player2);
  });

  it('should return "player2", if player 1 rock & player 2 paper', () => {
    const game = new MinRpsGame({ player1Move: MinRpsMove.Rock, player2Move: MinRpsMove.Paper });
    expect(game.result).toBe(MinRpsResult.Player2);
  });

  it('should return "player2", if player 1 paper & player 2 scissors', () => {
    const game = new MinRpsGame({
      player1Move: MinRpsMove.Paper,
      player2Move: MinRpsMove.Scissors,
    });
    expect(game.result).toBe(MinRpsResult.Player2);
  });
});
