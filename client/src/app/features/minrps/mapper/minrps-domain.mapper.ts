import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsGameViewModel } from '../models/viewmodels/minrps-game.viewmodel';

export class MinRpsDomainMapper {
  public static domainToViewModel(domain: MinRpsGame): MinRpsGameViewModel {
    const viewModel: MinRpsGameViewModel = new MinRpsGameViewModel();

    viewModel.createdAt = domain.createdAt;
    viewModel.id = domain.id;
    viewModel.name = domain.name;
    viewModel.observerCount = domain.observerCount;
    viewModel.playerCount = domain.playerCount;

    return viewModel;
  }
}
