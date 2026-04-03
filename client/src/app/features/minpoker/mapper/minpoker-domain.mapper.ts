import { MinPokerMatch } from '../models/domains/minpoker-match';
import { MinPokerMatchPlayer } from '../models/domains/minpoker-match-player';
import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerGameSeatViewModel, MinPokerGameViewModel } from '../models/viewmodels/minpoker-game.viewmodel';
import { MinPokerLobbyViewModel } from '../models/viewmodels/minpoker-lobby.viewmodel';

export class MinPokerDomainMapper {
  public static domainToGameViewModel(domain: MinPokerMatch, heroId: string): MinPokerGameViewModel {
    const viewModel: MinPokerGameViewModel = new MinPokerGameViewModel();

    viewModel.bigBlind = domain.bigBlind;
    viewModel.gameId = domain.id;
    viewModel.gameName = domain.name;
    viewModel.hand = [...domain.hand];
    viewModel.isObserver = domain.observerIds.includes(heroId) || !domain.players.some((p) => p?.id === heroId);
    viewModel.seats = domain.players.map((player: MinPokerMatchPlayer | null): MinPokerGameSeatViewModel | null =>
      player
        ? { avatar: player.avatar, id: player.id, name: player.name, seat: player.seat, stack: player.stack }
        : null,
    );
    viewModel.smallBlind = domain.smallBlind;
    viewModel.tableSize = domain.tableSize;

    return viewModel;
  }

  public static domainToLobbyViewModel(domain: MinPokerGame): MinPokerLobbyViewModel {
    const viewModel: MinPokerLobbyViewModel = new MinPokerLobbyViewModel();

    viewModel.bigBlind = domain.bigBlind;
    viewModel.createdAt = domain.createdAt;
    viewModel.id = domain.id;
    viewModel.maxPlayerCount = domain.tableSize;
    viewModel.name = domain.name;
    viewModel.observerCount = domain.observerCount;
    viewModel.playerCount = domain.playerCount;
    viewModel.smallBlind = domain.smallBlind;

    return viewModel;
  }
}
