import { MinRpsMove, MinRpsResult } from '../../../core/generated';
import { MinRpsViewmodelMapper } from './minrps-viewmodel.mapper';
import { MinRpsSingleplayerViewModel } from '../models/viewmodels/minrps-singleplayer.viewmodel';

describe('MinRpsViewmodelMapper', () => {
  describe('singlePlayerViewModelToDomain()', () => {
    it('should map singleplayer view model to domain', () => {
      const viewModel = new MinRpsSingleplayerViewModel();
      viewModel.player1Move = MinRpsMove.Rock;
      viewModel.player1SelectedMove = MinRpsMove.Rock;
      viewModel.player2Move = MinRpsMove.Scissors;
      viewModel.result = MinRpsResult.Player1;

      const domain = MinRpsViewmodelMapper.singlePlayerViewModelToDomain(viewModel);

      expect(domain.player1Move).toBe(MinRpsMove.Rock);
      expect(domain.player1SelectedMove).toBe(MinRpsMove.Rock);
      expect(domain.player2Move).toBe(MinRpsMove.Scissors);
      expect(domain.result).toBe(MinRpsResult.Player1);
    });

    it('should handle draw scenario', () => {
      const viewModel = new MinRpsSingleplayerViewModel();
      viewModel.player1Move = MinRpsMove.Paper;
      viewModel.player1SelectedMove = MinRpsMove.Paper;
      viewModel.player2Move = MinRpsMove.Paper;
      viewModel.result = MinRpsResult.Draw;

      const domain = MinRpsViewmodelMapper.singlePlayerViewModelToDomain(viewModel);

      expect(domain.result).toBe(MinRpsResult.Draw);
    });

    it('should handle unselected move', () => {
      const viewModel = new MinRpsSingleplayerViewModel();
      viewModel.player1Move = MinRpsMove.None;
      viewModel.player1SelectedMove = MinRpsMove.None;
      viewModel.player2Move = MinRpsMove.None;
      viewModel.result = MinRpsResult.None;

      const domain = MinRpsViewmodelMapper.singlePlayerViewModelToDomain(viewModel);

      expect(domain.player1SelectedMove).toBe(MinRpsMove.None);
      expect(domain.result).toBe(MinRpsResult.None);
    });
  });
});
