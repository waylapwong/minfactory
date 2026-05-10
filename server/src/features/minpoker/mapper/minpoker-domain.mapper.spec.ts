import { MinPokerGame } from '../models/domains/minpoker-game';
import { MinPokerPlayer } from '../models/domains/minpoker-player';
import { MinPokerGameDto } from '../models/dtos/minpoker-game.dto';
import { MinPokerGameEntity } from '../models/entities/minpoker-game.entity';
import { MinPokerHandDealtEvent } from '../models/events/minpoker-hand-dealt.event';
import { MinPokerUpdatedEvent } from '../models/events/minpoker-updated.event';
import { MinPokerDomainMapper } from './minpoker-domain.mapper';

describe('MinPokerDomainMapper', () => {
  describe('toDto()', () => {
    it('should map domain to DTO', () => {
      const domain = new MinPokerGame();
      domain.id = 'test-id';
      domain.name = 'Test Table';
      domain.createdAt = new Date('2025-01-01');
      domain.creatorId = 'creator-id';
      domain.isPublic = true;
      domain.bigBlind = 20;
      domain.smallBlind = 10;
      domain.tableSize = 9;
      domain.players = [new MinPokerPlayer({ id: 'p1', name: 'A' }), null, new MinPokerPlayer({ id: 'p2', name: 'B' })];
      domain.observers = new Map<string, MinPokerPlayer>([
        ['o1', new MinPokerPlayer({ id: 'o1' })],
        ['o2', new MinPokerPlayer({ id: 'o2' })],
      ]);

      const dto: MinPokerGameDto = MinPokerDomainMapper.toDto(domain);

      expect(dto.id).toBe('test-id');
      expect(dto.name).toBe('Test Table');
      expect(dto.createdAt).toEqual(new Date('2025-01-01'));
      expect(dto.creatorId).toBe('creator-id');
      expect(dto.bigBlind).toBe(20);
      expect(dto.smallBlind).toBe(10);
      expect(dto.tableSize).toBe(9);
      expect(dto.playerCount).toBe(2);
      expect(dto.observerCount).toBe(2);
      expect(dto.isPublic).toBe(true);
    });

    it('should use zero observers when observer map is missing', () => {
      const domain: MinPokerGame = new MinPokerGame();
      domain.observers = undefined as unknown as Map<string, MinPokerPlayer>;

      const dto: MinPokerGameDto = MinPokerDomainMapper.toDto(domain);

      expect(dto.observerCount).toBe(0);
    });
  });

  describe('toEntity()', () => {
    it('should map domain to entity', () => {
      const domain = new MinPokerGame();
      domain.id = 'test-id';
      domain.name = 'Test Table';
      domain.createdAt = new Date('2025-01-01');
      domain.isPublic = false;
      domain.tableSize = 6;
      domain.bigBlind = 50;
      domain.smallBlind = 25;
      domain.creatorId = 'creator-id';

      const entity: MinPokerGameEntity = MinPokerDomainMapper.toEntity(domain);

      expect(entity.id).toBe('test-id');
      expect(entity.name).toBe('Test Table');
      expect(entity.createdAt).toEqual(new Date('2025-01-01'));
      expect(entity.bigBlind).toBe(50);
      expect(entity.smallBlind).toBe(25);
      expect(entity.tableSize).toBe(6);
      expect(entity.isPublic).toBe(false);
      expect(entity.creator.id).toBe('creator-id');
    });

    it('should map generated entity fields and leave creator unset when creator id is missing', () => {
      const domain: MinPokerGame = new MinPokerGame({
        createdAt: new Date(0),
        creatorId: '',
        id: '',
        name: 'New Table',
      });

      const entity: MinPokerGameEntity = MinPokerDomainMapper.toEntity(domain);

      expect(entity.id).toBe('');
      expect(entity.createdAt).toEqual(new Date(0));
      expect(entity.creator).toBeUndefined();
      expect(entity.name).toBe('New Table');
    });
  });

  describe('toHandDealtEvent()', () => {
    it('should map dealt hand to event copy', () => {
      const hand: string[] = ['AS', 'KH'];

      const event: MinPokerHandDealtEvent = MinPokerDomainMapper.toHandDealtEvent(hand);

      expect(event.hand).toEqual(['AS', 'KH']);
      expect(event.hand).not.toBe(hand);
    });
  });

  describe('toUpdatedEvent()', () => {
    it('should map domain to updated event', () => {
      const domain: MinPokerGame = new MinPokerGame({
        bigBlind: 20,
        id: 'match-id',
        name: 'Updated Table',
        observers: new Map<string, MinPokerPlayer>([
          ['o1', new MinPokerPlayer({ id: 'o1' })],
          ['o2', new MinPokerPlayer({ id: 'o2' })],
        ]),
        players: [
          new MinPokerPlayer({ avatar: 'avatar-a', id: 'p1', name: 'A', seat: 0, stack: 180 }),
          null,
          new MinPokerPlayer({ avatar: 'avatar-b', id: 'p2', name: 'B', seat: 2, stack: 220 }),
        ],
        smallBlind: 10,
        tableSize: 3,
      });

      const event: MinPokerUpdatedEvent = MinPokerDomainMapper.toUpdatedEvent(domain);

      expect(event).toEqual({
        bigBlind: 20,
        matchId: 'match-id',
        name: 'Updated Table',
        observerIds: ['o1', 'o2'],
        players: [
          { avatar: 'avatar-a', id: 'p1', name: 'A', seat: 0, stack: 180 },
          { avatar: 'avatar-b', id: 'p2', name: 'B', seat: 2, stack: 220 },
        ],
        smallBlind: 10,
        tableSize: 3,
      });
    });
  });
});
