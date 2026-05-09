import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerMatch } from '../models/domains/minpoker-match';
import { MinPokerMatchPlayer } from '../models/domains/minpoker-match-player';
import { MinPokerDomainMapper } from './minpoker-domain.mapper';

describe('MinPokerDomainMapper', () => {
  describe('domainToGameViewModel()', () => {
    it('should map domain fields to game view model', () => {
      const domain = new MinPokerMatch({
        bigBlind: 20,
        id: 'match-1',
        name: 'Evening Table',
        observerIds: ['obs-1'],
        players: new Array(6).fill(null),
        smallBlind: 10,
        tableSize: 6,
      });

      const viewModel = MinPokerDomainMapper.domainToGameViewModel(domain, 'obs-1');

      expect(viewModel.bigBlind).toBe(20);
      expect(viewModel.gameId).toBe('match-1');
      expect(viewModel.gameName).toBe('Evening Table');
      expect(viewModel.smallBlind).toBe(10);
      expect(viewModel.tableSize).toBe(6);
    });

    it('should mark hero as observer when heroId is in observerIds', () => {
      const domain = new MinPokerMatch();
      domain.observerIds = ['player-1'];
      domain.players = [];

      const viewModel = MinPokerDomainMapper.domainToGameViewModel(domain, 'player-1');

      expect(viewModel.isObserver).toBeTrue();
    });

    it('should mark hero as observer when heroId is not seated', () => {
      const domain = new MinPokerMatch();
      domain.observerIds = [];
      domain.players = [new MinPokerMatchPlayer({ avatar: 'man-1.svg', id: 'player-1', name: 'Chris', seat: 0 })];

      const viewModel = MinPokerDomainMapper.domainToGameViewModel(domain, 'player-2');

      expect(viewModel.isObserver).toBeTrue();
    });

    it('should mark hero as not observer when heroId is in players', () => {
      const domain = new MinPokerMatch();
      domain.observerIds = [];
      domain.players = [new MinPokerMatchPlayer({ avatar: 'man-1.svg', id: 'player-1', name: 'Chris', seat: 0 })];

      const viewModel = MinPokerDomainMapper.domainToGameViewModel(domain, 'player-1');

      expect(viewModel.isObserver).toBeFalse();
    });

    it('should map hand to view model', () => {
      const domain = new MinPokerMatch();
      domain.hand = ['Ah', 'Ks'];
      domain.observerIds = [];
      domain.players = [];

      const viewModel = MinPokerDomainMapper.domainToGameViewModel(domain, '');

      expect(viewModel.hand).toEqual(['Ah', 'Ks']);
    });

    it('should return empty hand when match has no hand', () => {
      const domain = new MinPokerMatch();
      domain.observerIds = [];
      domain.players = [];

      const viewModel = MinPokerDomainMapper.domainToGameViewModel(domain, '');

      expect(viewModel.hand).toEqual([]);
    });

    it('should map seated players to correct seat positions', () => {
      const domain = new MinPokerMatch();
      domain.observerIds = [];
      domain.players = [
        new MinPokerMatchPlayer({ avatar: 'man-1.svg', id: 'p1', name: 'Alice', seat: 0, stack: 200 }),
        null,
        new MinPokerMatchPlayer({ avatar: 'woman-2.svg', id: 'p2', name: 'Bob', seat: 2, stack: 150 }),
      ];

      const viewModel = MinPokerDomainMapper.domainToGameViewModel(domain, '');

      expect(viewModel.seats[0]).toEqual(jasmine.objectContaining({ id: 'p1', name: 'Alice', seat: 0, stack: 200 }));
      expect(viewModel.seats[1]).toBeNull();
      expect(viewModel.seats[2]).toEqual(jasmine.objectContaining({ id: 'p2', name: 'Bob', seat: 2, stack: 150 }));
    });

    it('should create a copy of hand array', () => {
      const hand = ['Ah', 'Ks'];
      const domain = new MinPokerMatch();
      domain.hand = hand;
      domain.observerIds = [];
      domain.players = [];

      const viewModel = MinPokerDomainMapper.domainToGameViewModel(domain, '');
      hand.push('Qd');

      expect(viewModel.hand).toEqual(['Ah', 'Ks']);
    });
  });

  describe('toPublicGameVm()', () => {
    it('should map domain to lobby view model', () => {
      const domain = new MinPokerGame();
      domain.bigBlind = 100;
      domain.createdAt = new Date('2026-01-01T18:00:00.000Z');
      domain.id = 'game-id';
      domain.tableSize = 9;
      domain.name = 'Evening Table';
      domain.observerCount = 2;
      domain.playerCount = 4;
      domain.smallBlind = 50;

      const viewModel = MinPokerDomainMapper.toPublicGameVm(domain);

      expect(viewModel.id).toBe('game-id');
      expect(viewModel.name).toBe('Evening Table');
      expect(viewModel.createdAt).toEqual(new Date('2026-01-01T18:00:00.000Z'));
      expect(viewModel.maxPlayerCount).toBe(9);
      expect(viewModel.playerCount).toBe(4);
      expect(viewModel.observerCount).toBe(2);
      expect(viewModel.smallBlind).toBe(50);
      expect(viewModel.bigBlind).toBe(100);
    });
  });

  describe('toPublicGamesVm()', () => {
    it('should map domains to public games view model', () => {
      const domains: MinPokerGame[] = [
        new MinPokerGame({
          bigBlind: 100,
          createdAt: new Date('2026-01-01T18:00:00.000Z'),
          id: 'game-1',
          name: 'Evening Table',
          observerCount: 2,
          playerCount: 4,
          smallBlind: 50,
          tableSize: 9,
        }),
        new MinPokerGame({
          bigBlind: 20,
          createdAt: new Date('2026-01-02T18:00:00.000Z'),
          id: 'game-2',
          name: 'Quick Table',
          observerCount: 0,
          playerCount: 2,
          smallBlind: 10,
          tableSize: 6,
        }),
      ];

      const viewModel = MinPokerDomainMapper.toPublicGamesVm(domains);

      expect(viewModel.games).toEqual([
        jasmine.objectContaining({
          bigBlind: 100,
          createdAt: new Date('2026-01-01T18:00:00.000Z'),
          id: 'game-1',
          maxPlayerCount: 9,
          name: 'Evening Table',
          observerCount: 2,
          playerCount: 4,
          smallBlind: 50,
        }),
        jasmine.objectContaining({
          bigBlind: 20,
          createdAt: new Date('2026-01-02T18:00:00.000Z'),
          id: 'game-2',
          maxPlayerCount: 6,
          name: 'Quick Table',
          observerCount: 0,
          playerCount: 2,
          smallBlind: 10,
        }),
      ]);
    });

    it('should return an empty games array when no domains are provided', () => {
      const viewModel = MinPokerDomainMapper.toPublicGamesVm([]);

      expect(viewModel.games).toEqual([]);
    });
  });
});
