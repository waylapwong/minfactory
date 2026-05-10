import { LoggerService } from '../../../core/logging/services/logger.service';
import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerMatch } from '../models/domains/minpoker-match';
import { MinPokerMatchPlayer } from '../models/domains/minpoker-match-player';
import { MinPokerGameSeatVm, MinPokerGameVm } from '../models/viewmodels/minpoker-game.vm';
import { MinPokerPublicGameVm } from '../models/viewmodels/minpoker-public-game.vm';
import { MinPokerPublicGamesVm } from '../models/viewmodels/minpoker-public-games.vm';

export class MinPokerDomainMapper {
  private static readonly logger: LoggerService = new LoggerService(MinPokerDomainMapper.name);

  public static domainToGameViewModel(domain: MinPokerMatch, heroId: string): MinPokerGameVm {
    MinPokerDomainMapper.logger.debug(`START domainToGameViewModel(domain: ${JSON.stringify(domain)}, heroId: ${heroId})`);
    try {
      const viewModel: MinPokerGameVm = new MinPokerGameVm();

      viewModel.bigBlind = domain.bigBlind;
      viewModel.gameId = domain.id;
      viewModel.gameName = domain.name;
      viewModel.hand = [...domain.hand];
      viewModel.isObserver = domain.observerIds.includes(heroId) || !domain.players.some((p) => p?.id === heroId);
      viewModel.seats = domain.players.map((player: MinPokerMatchPlayer | null): MinPokerGameSeatVm | null => {
        if (!player) {
          return null;
        }

        const seatViewModel: MinPokerGameSeatVm = new MinPokerGameSeatVm();
        seatViewModel.avatar = player.avatar;
        seatViewModel.id = player.id;
        seatViewModel.name = player.name;
        seatViewModel.seat = player.seat;
        seatViewModel.stack = player.stack;

        return seatViewModel;
      });
      viewModel.smallBlind = domain.smallBlind;
      viewModel.tableSize = domain.tableSize;

      return viewModel;
    } finally {
      MinPokerDomainMapper.logger.debug(`END domainToGameViewModel(...)`);
    }
  }

  public static toPublicGameVm(domain: MinPokerGame): MinPokerPublicGameVm {
    MinPokerDomainMapper.logger.debug(`START toPublicGameVm(domain: ${JSON.stringify(domain)})`);
    try {
      const viewModel: MinPokerPublicGameVm = new MinPokerPublicGameVm();

      viewModel.bigBlind = domain.bigBlind;
      viewModel.createdAt = domain.createdAt;
      viewModel.id = domain.id;
      viewModel.maxPlayerCount = domain.tableSize;
      viewModel.name = domain.name;
      viewModel.observerCount = domain.observerCount;
      viewModel.playerCount = domain.playerCount;
      viewModel.smallBlind = domain.smallBlind;

      return viewModel;
    } finally {
      MinPokerDomainMapper.logger.debug(`END toPublicGameVm(...)`);
    }
  }

  public static toPublicGamesVm(domains: MinPokerGame[]): MinPokerPublicGamesVm {
    MinPokerDomainMapper.logger.debug(`START toPublicGamesVm(domains: ${JSON.stringify(domains)})`);
    try {
      const viewModel: MinPokerPublicGamesVm = new MinPokerPublicGamesVm();

      viewModel.games = domains.map(MinPokerDomainMapper.toPublicGameVm);

      return viewModel;
    } finally {
      MinPokerDomainMapper.logger.debug(`END toPublicGamesVm(...)`);
    }
  }
}
