import { MinRpsMove, MinRpsResult } from '../../../../core/generated';
import { MinRpsSingleplayerViewModel } from './minrps-singleplayer.viewmodel';

describe('MinRpsSingleplayerViewModel', () => {
  it('should create instance with properties', () => {
    const viewModel = new MinRpsSingleplayerViewModel();
    viewModel.player1Move = MinRpsMove.Rock;
    viewModel.player1SelectedMove = MinRpsMove.Rock;
    viewModel.player2Move = MinRpsMove.Scissors;
    viewModel.result = MinRpsResult.Player1;

    expect(viewModel.player1Move).toBe(MinRpsMove.Rock);
    expect(viewModel.player1SelectedMove).toBe(MinRpsMove.Rock);
    expect(viewModel.player2Move).toBe(MinRpsMove.Scissors);
    expect(viewModel.result).toBe(MinRpsResult.Player1);
  });
});
