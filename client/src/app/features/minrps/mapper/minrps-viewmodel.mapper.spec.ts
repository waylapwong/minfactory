import { MinRpsMove, MinRpsResult } from '../../../core/generated';
import { MinRpsSingleplayerViewModel } from '../models/viewmodels/minrps-singleplayer.viewmodel';
import { MinRpsViewmodelMapper } from './minrps-viewmodel.mapper';

describe('MinRpsViewmodelMapper', () => {
  describe('singlePlayerViewModelToDomain()', () => {
    it('should map singleplayer view model to domain', () => {
      const viewModel = new MinRpsSingleplayerViewModel();
      viewModel.player1Move = MinRpsMove.Rock;
      viewModel.player2Move = MinRpsMove.Scissors;
      viewModel.result = MinRpsResult.Player1;

      const domain = MinRpsViewmodelMapper.singlePlayerViewModelToDomain(viewModel);

      expect(domain.player1.move).toBe(MinRpsMove.Rock);
      expect(domain.player2.move).toBe(MinRpsMove.Scissors);
      expect(domain.result).toBe(MinRpsResult.Player1);
    });

    it('should handle draw scenario', () => {
      const viewModel = new MinRpsSingleplayerViewModel();
      viewModel.player1Move = MinRpsMove.Paper;
      viewModel.player2Move = MinRpsMove.Paper;
      viewModel.result = MinRpsResult.Draw;

      const domain = MinRpsViewmodelMapper.singlePlayerViewModelToDomain(viewModel);

      expect(domain.result).toBe(MinRpsResult.Draw);
    });

    it('should handle unselected move', () => {
      const viewModel = new MinRpsSingleplayerViewModel();
      viewModel.player1Move = MinRpsMove.None;
      viewModel.player2Move = MinRpsMove.None;
      viewModel.result = MinRpsResult.None;

      const domain = MinRpsViewmodelMapper.singlePlayerViewModelToDomain(viewModel);

      expect(domain.result).toBe(MinRpsResult.None);
    });
  });
});
