import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsSingleplayerViewModel } from '../models/viewmodels/minrps-singleplayer.viewmodel';

export class MinRpsViewmodelMapper {
  public static singlePlayerViewModelToDomain(viewModel: MinRpsSingleplayerViewModel): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame();

    domain.player1Move = viewModel.player1Move;
    domain.player1SelectedMove = viewModel.player1SelectedMove;
    domain.player2Move = viewModel.player2Move;
    domain.result = viewModel.result;

    return domain;
  }
}
