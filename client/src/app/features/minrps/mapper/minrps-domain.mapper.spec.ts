import { MinRpsMove, MinRpsResult } from '../../../core/generated';
import { MinRpsDomainMapper } from './minrps-domain.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';

describe('MinRpsDomainMapper', () => {
  describe('domainToOverviewViewModel()', () => {
    it('should map domain to overview view model', () => {
      const domain = new MinRpsGame();
      domain.id = 'test-id';
      domain.name = 'Test Game';
      domain.createdAt = new Date('2024-01-01');
      for (let i = 0; i < 5; i++) domain.observers.set(`obs-${i}`, new MinRpsPlayer());
      domain.playerCount = 2;

      const viewModel = MinRpsDomainMapper.domainToOverviewViewModel(domain);

      expect(viewModel.id).toBe('test-id');
      expect(viewModel.name).toBe('Test Game');
      expect(viewModel.createdAt).toEqual(new Date('2024-01-01'));
      expect(viewModel.observerCount).toBe(5);
      expect(viewModel.playerCount).toBe(2);
    });

    it('should handle game with no players', () => {
      const domain = new MinRpsGame();
      domain.id = 'test-id';
      domain.name = 'Empty Game';
      domain.createdAt = new Date();
      domain.playerCount = 0;

      const viewModel = MinRpsDomainMapper.domainToOverviewViewModel(domain);

      expect(viewModel.playerCount).toBe(0);
      expect(viewModel.observerCount).toBe(0);
    });
  });

  describe('domainToPlayDto()', () => {
    it('should map domain to play DTO', () => {
      const domain = new MinRpsGame();
      domain.player1Move = MinRpsMove.Rock;

      const dto = MinRpsDomainMapper.domainToPlayDto(domain);

      expect(dto.player1Move).toBe(MinRpsMove.Rock);
    });

    it('should map Paper move correctly', () => {
      const domain = new MinRpsGame();
      domain.player1Move = MinRpsMove.Paper;

      const dto = MinRpsDomainMapper.domainToPlayDto(domain);

      expect(dto.player1Move).toBe(MinRpsMove.Paper);
    });

    it('should map Scissors move correctly', () => {
      const domain = new MinRpsGame();
      domain.player1Move = MinRpsMove.Scissors;

      const dto = MinRpsDomainMapper.domainToPlayDto(domain);

      expect(dto.player1Move).toBe(MinRpsMove.Scissors);
    });
  });

  describe('domainToSingleplayerViewModel()', () => {
    it('should map domain to singleplayer view model', () => {
      const domain = new MinRpsGame();
      domain.player1Move = MinRpsMove.Rock;
      domain.player1SelectedMove = MinRpsMove.Rock;
      domain.player2Move = MinRpsMove.Scissors;
      domain.result = MinRpsResult.Player1;

      const viewModel = MinRpsDomainMapper.domainToSingleplayerViewModel(domain);

      expect(viewModel.player1Move).toBe(MinRpsMove.Rock);
      expect(viewModel.player1SelectedMove).toBe(MinRpsMove.Rock);
      expect(viewModel.player2Move).toBe(MinRpsMove.Scissors);
      expect(viewModel.result).toBe(MinRpsResult.Player1);
    });

    it('should handle draw result', () => {
      const domain = new MinRpsGame();
      domain.player1Move = MinRpsMove.Paper;
      domain.player1SelectedMove = MinRpsMove.Paper;
      domain.player2Move = MinRpsMove.Paper;
      domain.result = MinRpsResult.Draw;

      const viewModel = MinRpsDomainMapper.domainToSingleplayerViewModel(domain);

      expect(viewModel.result).toBe(MinRpsResult.Draw);
    });

    it('should handle player2 win', () => {
      const domain = new MinRpsGame();
      domain.player1Move = MinRpsMove.Rock;
      domain.player1SelectedMove = MinRpsMove.Rock;
      domain.player2Move = MinRpsMove.Paper;
      domain.result = MinRpsResult.Player2;

      const viewModel = MinRpsDomainMapper.domainToSingleplayerViewModel(domain);

      expect(viewModel.result).toBe(MinRpsResult.Player2);
    });
  });
});
