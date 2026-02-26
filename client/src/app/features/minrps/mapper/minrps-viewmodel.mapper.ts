import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsSingleplayerViewModel } from '../models/viewmodels/minrps-singleplayer.viewmodel';

export class MinRpsViewmodelMapper {
  public static singlePlayerViewModelToDomain(viewModel: MinRpsSingleplayerViewModel): MinRpsGame {
    const domain: MinRpsGame = new MinRpsGame();

    domain.player1.move = viewModel.player1Move;
    domain.player1.selectedMove = viewModel.player1SelectedMove;
    domain.player2.move = viewModel.player2Move;
    domain.result = viewModel.result;

    return domain;
  }
}
