import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerLobbyViewModel } from '../models/viewmodels/minpoker-lobby.viewmodel';

export class MinPokerDomainMapper {
  public static domainToLobbyViewModel(domain: MinPokerGame): MinPokerLobbyViewModel {
    const viewModel: MinPokerLobbyViewModel = new MinPokerLobbyViewModel();

    viewModel.bigBlind = domain.bigBlind;
    viewModel.createdAt = domain.createdAt;
    viewModel.id = domain.id;
    viewModel.maxPlayerCount = domain.maxPlayerCount;
    viewModel.name = domain.name;
    viewModel.observerCount = domain.observerCount;
    viewModel.playerCount = domain.playerCount;
    viewModel.smallBlind = domain.smallBlind;

    return viewModel;
  }
}
