import { MinRpsPlayDto } from '../../../core/generated';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsOverviewViewModel } from '../models/viewmodels/minrps-overview.viewmodel';
import { MinRpsSingleplayerViewModel } from '../models/viewmodels/minrps-singleplayer.viewmodel';

export class MinRpsDomainMapper {
  public static domainToOverviewViewModel(domain: MinRpsGame): MinRpsOverviewViewModel {
    const viewModel: MinRpsOverviewViewModel = new MinRpsOverviewViewModel();

    viewModel.createdAt = domain.createdAt;
    viewModel.id = domain.id;
    viewModel.name = domain.name;
    viewModel.observerCount = domain.observerCount;
    viewModel.playerCount = domain.playerCount;

    return viewModel;
  }

  public static domainToPlayDto(domain: MinRpsGame): MinRpsPlayDto {
    const dto: MinRpsPlayDto = {
      player1Move: domain.player1Move,
    };

    return dto;
  }

  public static domainToSingleplayerViewModel(domain: MinRpsGame): MinRpsSingleplayerViewModel {
    const viewModel: MinRpsSingleplayerViewModel = new MinRpsSingleplayerViewModel();

    viewModel.player1Move = domain.player1Move;
    viewModel.player1SelectedMove = domain.player1SelectedMove;
    viewModel.player2Move = domain.player2Move;
    viewModel.result = domain.result;

    return viewModel;
  }
}
