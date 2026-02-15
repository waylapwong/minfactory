import { MinRPSGame } from '../models/domain/minrps-game';
import { MinRPSMove } from '../models/enums/minrps-move.enum';
import { MinRPSDtoMapper, MinRPSGameDto } from './minrps-dto.mapper';

describe('MinRPSDtoMapper', () => {
  describe('toDomain()', () => {
    it('should map all valid dto move combinations to the domain model', () => {
      const testCases: MinRPSGameDto[] = [
        { player1Move: MinRPSMove.None, player2Move: MinRPSMove.None },
        { player1Move: MinRPSMove.Rock, player2Move: MinRPSMove.Paper },
        { player1Move: MinRPSMove.Paper, player2Move: MinRPSMove.Scissors },
        { player1Move: MinRPSMove.Scissors, player2Move: MinRPSMove.Rock },
      ];

      for (const dto of testCases) {
        const result = MinRPSDtoMapper.toDomain(dto);

        expect(result).toEqual(
          new MinRPSGame({
            player1Move: dto.player1Move as MinRPSMove,
            player2Move: dto.player2Move as MinRPSMove,
          }),
        );
      }
    });

    it('should fallback to "none" for unknown dto moves', () => {
      const dto: MinRPSGameDto = {
        player1Move: 'invalid-move',
        player2Move: MinRPSMove.Scissors,
      };

      const result = MinRPSDtoMapper.toDomain(dto);

      expect(result.player1Move).toBe(MinRPSMove.None);
      expect(result.player2Move).toBe(MinRPSMove.Scissors);
    });
  });

  describe('toDto()', () => {
    it('should map domain model to dto', () => {
      const domain = new MinRPSGame({
        player1Move: MinRPSMove.Paper,
        player2Move: MinRPSMove.Rock,
      });

      const result = MinRPSDtoMapper.toDto(domain);

      expect(result).toEqual({
        player1Move: MinRPSMove.Paper,
        player2Move: MinRPSMove.Rock,
      });
    });
  });
});
