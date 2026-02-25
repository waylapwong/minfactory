import { MinRpsPlayDto } from '../../../core/generated';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsMultiplayerViewModel } from '../models/viewmodels/minrps-multiplayer.viewmodel';
import { MinRpsOverviewViewModel } from '../models/viewmodels/minrps-overview.viewmodel';
import { MinRpsSingleplayerViewModel } from '../models/viewmodels/minrps-singleplayer.viewmodel';

export class MinRpsDomainMapper {
  public static domainToMultiplayerViewModel(
    domain: MinRpsGame,
    isPlayer2: boolean,
  ): MinRpsMultiplayerViewModel {
    const viewModel: MinRpsMultiplayerViewModel = new MinRpsMultiplayerViewModel();

    const hero: MinRpsPlayer = isPlayer2 ? domain.player2 : domain.player1;
    const villain: MinRpsPlayer = isPlayer2 ? domain.player1 : domain.player2;

    viewModel.heroMove = hero.move;
    viewModel.heroName = hero.name;
    viewModel.heroSelectedMove = hero.selectedMove;
    viewModel.result = domain.result;
    viewModel.villainMove = villain.move;
    viewModel.villainName = villain.name;
    viewModel.villainSelectedMove = villain.selectedMove;

    return viewModel;
  }

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
      player1Move: domain.player1.move,
    };

    return dto;
  }

  public static domainToSingleplayerViewModel(domain: MinRpsGame): MinRpsSingleplayerViewModel {
    const viewModel: MinRpsSingleplayerViewModel = new MinRpsSingleplayerViewModel();

    viewModel.player1Move = domain.player1.move;
    viewModel.player1SelectedMove = domain.player1.selectedMove;
    viewModel.player2Move = domain.player2.move;
    viewModel.result = domain.result;

    return viewModel;
  }
}
