import { MinRpsMove } from '../../../../core/generated';
import { MinRpsMultiplayerViewModel } from './minrps-multiplayer.viewmodel';

describe('MinRpsMultiplayerViewModel', () => {
  it('should create instance with properties', () => {
    const viewModel = new MinRpsMultiplayerViewModel();
    viewModel.gameId = 'game-123';
    viewModel.playerId = 'player-123';
    viewModel.player1Id = 'p1';
    viewModel.player1Name = 'Alice';
    viewModel.player1HasSelectedMove = true;
    viewModel.player1Move = MinRpsMove.Rock;
    viewModel.player2Id = 'p2';
    viewModel.player2Name = 'Bob';
    viewModel.player2HasSelectedMove = false;
    viewModel.player2Move = MinRpsMove.None;

    expect(viewModel.gameId).toBe('game-123');
    expect(viewModel.playerId).toBe('player-123');
    expect(viewModel.player1Id).toBe('p1');
    expect(viewModel.player1Name).toBe('Alice');
    expect(viewModel.player1HasSelectedMove).toBe(true);
    expect(viewModel.player1Move).toBe(MinRpsMove.Rock);
    expect(viewModel.player2Id).toBe('p2');
    expect(viewModel.player2Name).toBe('Bob');
    expect(viewModel.player2HasSelectedMove).toBe(false);
    expect(viewModel.player2Move).toBe(MinRpsMove.None);
  });
});
