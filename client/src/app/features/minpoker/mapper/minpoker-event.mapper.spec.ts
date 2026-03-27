import { MinPokerMatchUpdatedEvent } from '../models/events/minpoker-match-updated.event';
import { MinPokerEventMapper } from './minpoker-event.mapper';

describe('MinPokerEventMapper', () => {
  describe('matchUpdatedEventToDomain()', () => {
    it('should map event fields to domain', () => {
      const event: MinPokerMatchUpdatedEvent = {
        bigBlind: 20,
        matchId: 'match-1',
        name: 'Evening Table',
        observerIds: ['obs-1', 'obs-2'],
        players: [],
        smallBlind: 10,
        tableSize: 6,
      };

      const domain = MinPokerEventMapper.matchUpdatedEventToDomain(event);

      expect(domain.bigBlind).toBe(20);
      expect(domain.id).toBe('match-1');
      expect(domain.name).toBe('Evening Table');
      expect(domain.observerIds).toEqual(['obs-1', 'obs-2']);
      expect(domain.smallBlind).toBe(10);
      expect(domain.tableSize).toBe(6);
    });

    it('should create a players array of tableSize length filled with null', () => {
      const event: MinPokerMatchUpdatedEvent = {
        bigBlind: 20,
        matchId: 'match-1',
        name: 'Table',
        observerIds: [],
        players: [],
        smallBlind: 10,
        tableSize: 4,
      };

      const domain = MinPokerEventMapper.matchUpdatedEventToDomain(event);

      expect(domain.players.length).toBe(4);
      expect(domain.players.every((p) => p === null)).toBeTrue();
    });

    it('should place players at the correct seat index', () => {
      const event: MinPokerMatchUpdatedEvent = {
        bigBlind: 20,
        matchId: 'match-1',
        name: 'Table',
        observerIds: [],
        players: [
          { avatar: 'man-1.svg', id: 'p1', name: 'Alice', seat: 0 },
          { avatar: 'woman-2.svg', id: 'p2', name: 'Bob', seat: 3 },
        ],
        smallBlind: 10,
        tableSize: 6,
      };

      const domain = MinPokerEventMapper.matchUpdatedEventToDomain(event);

      expect(domain.players[0]).toEqual(jasmine.objectContaining({ id: 'p1', name: 'Alice', seat: 0 }));
      expect(domain.players[1]).toBeNull();
      expect(domain.players[2]).toBeNull();
      expect(domain.players[3]).toEqual(jasmine.objectContaining({ id: 'p2', name: 'Bob', seat: 3 }));
      expect(domain.players[4]).toBeNull();
      expect(domain.players[5]).toBeNull();
    });

    it('should create a copy of observerIds array', () => {
      const observerIds = ['obs-1'];
      const event: MinPokerMatchUpdatedEvent = {
        bigBlind: 0,
        matchId: '',
        name: '',
        observerIds,
        players: [],
        smallBlind: 0,
        tableSize: 2,
      };

      const domain = MinPokerEventMapper.matchUpdatedEventToDomain(event);
      observerIds.push('obs-2');

      expect(domain.observerIds).toEqual(['obs-1']);
    });
  });
});
