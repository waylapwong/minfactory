import { MinRPSMove } from '../enums/minrps-move.enum';
import { MinRPSResult } from '../enums/minrps-result.enum';
import { MinRPSGame } from './minrps-game';

describe('result()', () => {
  it('should return "none", if player 1 has no move', () => {
    const game = new MinRPSGame({ player1Move: MinRPSMove.None, player2Move: MinRPSMove.Rock });
    expect(game.result).toBe(MinRPSResult.None);
  });

  it('should return "none", if player 2 has no move', () => {
    const game = new MinRPSGame({ player1Move: MinRPSMove.Rock, player2Move: MinRPSMove.None });
    expect(game.result).toBe(MinRPSResult.None);
  });

  it('should return "draw", if both players have same moves', () => {
    const game = new MinRPSGame({ player1Move: MinRPSMove.Rock, player2Move: MinRPSMove.Rock });
    expect(game.result).toBe(MinRPSResult.Draw);
  });

  it('should return "player1", if player 1 rock & player 2 scissors', () => {
    const game = new MinRPSGame({ player1Move: MinRPSMove.Rock, player2Move: MinRPSMove.Scissors });
    expect(game.result).toBe(MinRPSResult.Player1);
  });

  it('should return "player1", if player 1 scissors & player 2 paper', () => {
    const game = new MinRPSGame({
      player1Move: MinRPSMove.Scissors,
      player2Move: MinRPSMove.Paper,
    });
    expect(game.result).toBe(MinRPSResult.Player1);
  });

  it('should return "player1", if player 1 paper & player 2 rock', () => {
    const game = new MinRPSGame({ player1Move: MinRPSMove.Paper, player2Move: MinRPSMove.Rock });
    expect(game.result).toBe(MinRPSResult.Player1);
  });

  it('should return "player2", if player 1 scissors & player 2 rock', () => {
    const game = new MinRPSGame({ player1Move: MinRPSMove.Scissors, player2Move: MinRPSMove.Rock });
    expect(game.result).toBe(MinRPSResult.Player2);
  });

  it('should return "player2", if player 1 rock & player 2 paper', () => {
    const game = new MinRPSGame({ player1Move: MinRPSMove.Rock, player2Move: MinRPSMove.Paper });
    expect(game.result).toBe(MinRPSResult.Player2);
  });

  it('should return "player2", if player 1 paper & player 2 scissors', () => {
    const game = new MinRPSGame({
      player1Move: MinRPSMove.Paper,
      player2Move: MinRPSMove.Scissors,
    });
    expect(game.result).toBe(MinRPSResult.Player2);
  });
});
