import { MinRpsMove, MinRpsResult } from '../../../core/generated';
import { MinRpsMatchUpdatedPayload } from '../models/payloads/minrps-match-updated.payload';
import { MinRpsPayloadMapper } from './minrps-payload.mapper';

describe('MinRpsPayloadMapper', () => {
  describe('matchUpdatedPayloadToDomain()', () => {
    it('should map payload to domain', () => {
      const payload: MinRpsMatchUpdatedPayload = {
        matchId: 'game-123',
        observers: ['observer-1', 'observer-2'],
        player1HasSelectedMove: true,
        player1Id: 'player-1',
        player1Move: MinRpsMove.Rock,
        player1Name: 'Alice',
        player2HasSelectedMove: false,
        player2Id: 'player-2',
        player2Move: MinRpsMove.None,
        player2Name: 'Bob',
        result: MinRpsResult.Player1,
        resultHistory: [MinRpsResult.Player1, MinRpsResult.Draw],
      };

      const domain = MinRpsPayloadMapper.matchUpdatedPayloadToDomain(payload);

      expect(domain.id).toBe('game-123');
      expect(domain.observerCount).toBe(2);
      expect(domain.observers.get('observer-1')?.id).toBe('observer-1');
      expect(domain.observers.get('observer-2')?.id).toBe('observer-2');
      expect(domain.player1.id).toBe('player-1');
      expect(domain.player1.name).toBe('Alice');
      expect(domain.player1.move).toBe(MinRpsMove.Rock);
      expect(domain.player1.hasSelectedMove).toBeTrue();
      expect(domain.player2.id).toBe('player-2');
      expect(domain.player2.name).toBe('Bob');
      expect(domain.player2.move).toBe(MinRpsMove.None);
      expect(domain.player2.hasSelectedMove).toBeFalse();
      expect(domain.result).toBe(MinRpsResult.Player1);
      expect(domain.resultHistory).toEqual([MinRpsResult.Player1, MinRpsResult.Draw]);
    });

    it('should create a new result history array', () => {
      const payload: MinRpsMatchUpdatedPayload = {
        matchId: 'game-123',
        observers: [],
        player1HasSelectedMove: false,
        player1Id: 'player-1',
        player1Move: MinRpsMove.Paper,
        player1Name: 'Alice',
        player2HasSelectedMove: true,
        player2Id: 'player-2',
        player2Move: MinRpsMove.Scissors,
        player2Name: 'Bob',
        result: MinRpsResult.Player2,
        resultHistory: [MinRpsResult.Draw],
      };

      const domain = MinRpsPayloadMapper.matchUpdatedPayloadToDomain(payload);

      expect(domain.resultHistory).not.toBe(payload.resultHistory);

      payload.resultHistory.push(MinRpsResult.Player1);

      expect(domain.resultHistory).toEqual([MinRpsResult.Draw]);
    });

    it('should fallback to empty result history when payload history is missing', () => {
      const payload: MinRpsMatchUpdatedPayload = {
        matchId: 'game-123',
        observers: [],
        player1HasSelectedMove: false,
        player1Id: 'player-1',
        player1Move: MinRpsMove.None,
        player1Name: 'Alice',
        player2HasSelectedMove: false,
        player2Id: 'player-2',
        player2Move: MinRpsMove.None,
        player2Name: 'Bob',
        result: MinRpsResult.None,
        resultHistory: undefined as unknown as MinRpsResult[],
      };

      const domain = MinRpsPayloadMapper.matchUpdatedPayloadToDomain(payload);

      expect(domain.resultHistory).toEqual([]);
    });
  });
});
