import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsGameDto } from '../models/dtos/minrps-game.dto';
import { MinRpsPlayResultDto } from '../models/dtos/minrps-play-result.dto';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';
import { MinRpsResult } from '../models/enums/minrps-game-result.enum';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsDomainMapper } from './minrps-domain.mapper';

describe('MinRpsDomainMapper', () => {
  describe('domainToDto', () => {
    it('should map domain to DTO', () => {
      const domain = new MinRpsGame();
      domain.id = 'test-id';
      domain.name = 'Test Game';
      domain.createdAt = new Date('2024-01-01');

      const player1 = new MinRpsPlayer();
      player1.id = 'player-1';
      domain.setPlayer1(player1);

      const player2 = new MinRpsPlayer();
      player2.id = 'player-2';
      domain.setPlayer2(player2);

      const dto: MinRpsGameDto = MinRpsDomainMapper.domainToDto(domain);

      expect(dto.id).toBe('test-id');
      expect(dto.name).toBe('Test Game');
      expect(dto.createdAt).toEqual(new Date('2024-01-01'));
      expect(dto.playerCount).toBe(2);
      expect(dto.observerCount).toBe(0);
    });

    it('should count observers correctly', () => {
      const domain = new MinRpsGame();
      domain.addObserver('observer-1');
      domain.addObserver('observer-2');

      const dto: MinRpsGameDto = MinRpsDomainMapper.domainToDto(domain);

      expect(dto.observerCount).toBe(2);
    });
  });

  describe('domainToEntity', () => {
    it('should map domain to entity', () => {
      const domain = new MinRpsGame();
      domain.id = 'test-id';
      domain.name = 'Test Game';
      domain.createdAt = new Date('2024-01-01');

      const entity: MinRpsGameEntity = MinRpsDomainMapper.domainToEntity(domain);

      expect(entity.id).toBe('test-id');
      expect(entity.name).toBe('Test Game');
      expect(entity.createdAt).toEqual(new Date('2024-01-01'));
    });
  });

  describe('domainToPlayResultDto', () => {
    it('should map domain to play result DTO', () => {
      const domain = new MinRpsGame();
      const player1 = new MinRpsPlayer();
      player1.move = MinRpsMove.Rock;
      domain.setPlayer1(player1);

      const player2 = new MinRpsPlayer();
      player2.move = MinRpsMove.Scissors;
      domain.setPlayer2(player2);

      const dto: MinRpsPlayResultDto = MinRpsDomainMapper.domainToPlayResultDto(domain);

      expect(dto.player1Move).toBe(MinRpsMove.Rock);
      expect(dto.player2Move).toBe(MinRpsMove.Scissors);
      expect(dto.result).toBe(MinRpsResult.None);
    });
  });

  describe('domainToMatchUpdatedPayload', () => {
    it('should map domain to match updated payload', () => {
      const domain = new MinRpsGame();
      domain.id = 'match-1';

      const player1 = new MinRpsPlayer();
      player1.id = 'player-1';
      player1.name = 'Alice';
      player1.move = MinRpsMove.Rock;
      domain.setPlayer1(player1);

      const player2 = new MinRpsPlayer();
      player2.id = 'player-2';
      player2.name = 'Bob';
      player2.move = MinRpsMove.Paper;
      domain.setPlayer2(player2);

      const payload = MinRpsDomainMapper.domainToMatchUpdatedPayload(domain);

      expect(payload.matchId).toBe('match-1');
      expect(payload.player1Id).toBe('player-1');
      expect(payload.player1Name).toBe('Alice');
      expect(payload.player1Move).toBe(MinRpsMove.Rock);
      expect(payload.player2Id).toBe('player-2');
      expect(payload.player2Name).toBe('Bob');
      expect(payload.player2Move).toBe(MinRpsMove.Paper);
    });

    it('should set result to None when game is not ready', () => {
      const domain = new MinRpsGame();
      domain.id = 'match-1';

      const payload = MinRpsDomainMapper.domainToMatchUpdatedPayload(domain);

      expect(payload.result).toBe(MinRpsResult.None);
    });
  });
});
