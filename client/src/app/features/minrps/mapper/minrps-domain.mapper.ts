import { MinRpsPlayDto } from '../../../core/generated';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsMultiplayerViewModel } from '../models/viewmodels/minrps-multiplayer.viewmodel';
import { MinRpsOverviewViewModel } from '../models/viewmodels/minrps-overview.viewmodel';
import { MinRpsSingleplayerViewModel } from '../models/viewmodels/minrps-singleplayer.viewmodel';

export class MinRpsDomainMapper {
  public static domainToMultiplayerViewModel(domain: MinRpsGame, heroId: string): MinRpsMultiplayerViewModel {
    const viewModel: MinRpsMultiplayerViewModel = new MinRpsMultiplayerViewModel();

    const hero: MinRpsPlayer = heroId === domain.player2.id ? domain.player2 : domain.player1;
    const villain: MinRpsPlayer = heroId === domain.player2.id ? domain.player1 : domain.player2;

    viewModel.gameId = domain.id;
    viewModel.heroMove = hero.move;
    viewModel.heroName = hero.name;
    viewModel.result = domain.result;
    viewModel.villainMove = villain.move;
    viewModel.villainName = villain.name;

    viewModel.isObserver = heroId !== domain.player1.id && heroId !== domain.player2.id && domain.observers.has(heroId);
    viewModel.canTakeHeroSeat = viewModel.isObserver && !domain.player1.id;
    viewModel.canTakeVillainSeat = viewModel.isObserver && !domain.player2.id;

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
    viewModel.player2Move = domain.player2.move;
    viewModel.result = domain.result;

    return viewModel;
  }
}
