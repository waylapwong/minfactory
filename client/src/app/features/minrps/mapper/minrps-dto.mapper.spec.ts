import { MinRpsGameDto, MinRpsMove, MinRpsPlayResultDto, MinRpsResult } from '../../../core/generated';
import { MinRpsDtoMapper } from './minrps-dto.mapper';

describe('MinRpsDtoMapper', () => {
  describe('gameDtoToDomain()', () => {
    it('should map game DTO to domain', () => {
      const dto: MinRpsGameDto = {
        id: 'test-id',
        name: 'Test Game',
        createdAt: '2024-01-01T00:00:00.000Z',
        observerCount: 3,
        playerCount: 2,
      };

      const domain = MinRpsDtoMapper.gameDtoToDomain(dto);

      expect(domain.id).toBe('test-id');
      expect(domain.name).toBe('Test Game');
      expect(domain.createdAt).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(domain.observerCount).toBe(3);
      expect(domain.playerCount).toBe(2);
    });

    it('should handle empty game', () => {
      const dto: MinRpsGameDto = {
        id: 'empty-id',
        name: '',
        createdAt: new Date().toISOString(),
        observerCount: 0,
        playerCount: 0,
      };

      const domain = MinRpsDtoMapper.gameDtoToDomain(dto);

      expect(domain.name).toBe('');
      expect(domain.observerCount).toBe(0);
      expect(domain.playerCount).toBe(0);
    });
  });

  describe('playResultDtoToDomain()', () => {
    it('should map play result DTO to domain with player1 win', () => {
      const dto: MinRpsPlayResultDto = {
        player1Move: MinRpsMove.Rock,
        player2Move: MinRpsMove.Scissors,
        result: MinRpsResult.Player1,
      };

      const domain = MinRpsDtoMapper.playResultDtoToDomain(dto);

      expect(domain.player1.move).toBe(MinRpsMove.Rock);
      expect(domain.player2.move).toBe(MinRpsMove.Scissors);
      expect(domain.result).toBe(MinRpsResult.Player1);
    });

    it('should map play result DTO with draw', () => {
      const dto: MinRpsPlayResultDto = {
        player1Move: MinRpsMove.Paper,
        player2Move: MinRpsMove.Paper,
        result: MinRpsResult.Draw,
      };

      const domain = MinRpsDtoMapper.playResultDtoToDomain(dto);

      expect(domain.result).toBe(MinRpsResult.Draw);
    });

    it('should map play result DTO with player2 win', () => {
      const dto: MinRpsPlayResultDto = {
        player1Move: MinRpsMove.Scissors,
        player2Move: MinRpsMove.Rock,
        result: MinRpsResult.Player2,
      };

      const domain = MinRpsDtoMapper.playResultDtoToDomain(dto);

      expect(domain.result).toBe(MinRpsResult.Player2);
    });
  });
});
