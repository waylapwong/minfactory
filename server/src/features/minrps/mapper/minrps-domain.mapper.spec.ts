import { MinRpsDomainMapper } from './minrps-domain.mapper';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsGameDto } from '../models/dtos/minrps-game.dto';
import { MinRpsPlayResultDto } from '../models/dtos/minrps-play-result.dto';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsResult } from '../models/enums/minrps-game-result.enum';
import { MinRpsGameStateUpdatePayload } from '../models/payloads/minrps-game-state-update.payload';

describe('MinRpsDomainMapper', () => {
  describe('domainToDto', () => {
    it('should map domain to DTO with both players', () => {
      const domain = new MinRpsGame();
      domain.id = 'test-id';
      domain.name = 'Test Game';
      domain.createdAt = new Date('2024-01-01');
      domain.observerCount = 5;
      domain.player1 = new MinRpsPlayer();
      domain.player1.name = 'player1-name';
      domain.player2 = new MinRpsPlayer();
      domain.player2.name = 'player2-name';

      const dto: MinRpsGameDto = MinRpsDomainMapper.domainToDto(domain);

      expect(dto.id).toBe('test-id');
      expect(dto.name).toBe('Test Game');
      expect(dto.createdAt).toEqual(new Date('2024-01-01'));
      expect(dto.observerCount).toBe(5);
      expect(dto.playerCount).toBe(2);
    });

    it('should map domain to DTO with one player', () => {
      const domain = new MinRpsGame();
      domain.id = 'test-id';
      domain.name = 'Test Game';
      domain.createdAt = new Date('2024-01-01');
      domain.observerCount = 3;
      domain.player1 = new MinRpsPlayer();
      domain.player1.name = 'player1-name';
      domain.player2 = null as any;

      const dto: MinRpsGameDto = MinRpsDomainMapper.domainToDto(domain);

      expect(dto.playerCount).toBe(1);
    });

    it('should map domain to DTO with no players', () => {
      const domain = new MinRpsGame();
      domain.id = 'test-id';
      domain.name = 'Test Game';
      domain.createdAt = new Date('2024-01-01');
      domain.observerCount = 0;
      domain.player1 = null as any;
      domain.player2 = null as any;

      const dto: MinRpsGameDto = MinRpsDomainMapper.domainToDto(domain);

      expect(dto.playerCount).toBe(0);
    });
  });

  describe('domainToEntity', () => {
    it('should map domain to entity', () => {
      const domain = new MinRpsGame();
      domain.id = 'test-id';
      domain.name = 'Test Game';
      domain.createdAt = new Date('2024-01-01');
      domain.observerCount = 5;

      const entity: MinRpsGameEntity = MinRpsDomainMapper.domainToEntity(domain);

      expect(entity.id).toBe('test-id');
      expect(entity.name).toBe('Test Game');
      expect(entity.createdAt).toEqual(new Date('2024-01-01'));
    });
  });

  describe('domainToPlayResultDto', () => {
    it('should map domain to play result DTO', () => {
      const domain = new MinRpsGame();
      domain.player1 = new MinRpsPlayer();
      domain.player1.move = MinRpsMove.Rock;
      domain.player2 = new MinRpsPlayer();
      domain.player2.move = MinRpsMove.Scissors;

      const dto: MinRpsPlayResultDto = MinRpsDomainMapper.domainToPlayResultDto(domain);

      expect(dto.player1Move).toBe(MinRpsMove.Rock);
      expect(dto.player2Move).toBe(MinRpsMove.Scissors);
      expect(dto.result).toBe(MinRpsResult.None);
    });

    it('should map domain to play result DTO with different moves', () => {
      const domain = new MinRpsGame();
      domain.player1 = new MinRpsPlayer();
      domain.player1.move = MinRpsMove.Paper;
      domain.player2 = new MinRpsPlayer();
      domain.player2.move = MinRpsMove.Rock;

      const dto: MinRpsPlayResultDto = MinRpsDomainMapper.domainToPlayResultDto(domain);

      expect(dto.player1Move).toBe(MinRpsMove.Paper);
      expect(dto.player2Move).toBe(MinRpsMove.Rock);
      expect(dto.result).toBe(MinRpsResult.None);
    });
  });

  describe('domainToGameStateUpdatePayload', () => {
    it('should map domain to game state update payload', () => {
      const domain = new MinRpsGame();
      domain.id = 'test-game-id';
      const player1 = new MinRpsPlayer();
      player1.id = 'player-1-id';
      player1.name = 'Player 1';
      player1.move = MinRpsMove.Rock;
      domain.setPlayer1(player1);

      const player2 = new MinRpsPlayer();
      player2.id = 'player-2-id';
      player2.name = 'Player 2';
      player2.move = MinRpsMove.None;
      domain.setPlayer2(player2);

      const payload: MinRpsGameStateUpdatePayload =
        MinRpsDomainMapper.domainToGameStateUpdatePayload(domain);

      expect(payload.gameId).toBe('test-game-id');
      expect(payload.player1Id).toBe('player-1-id');
      expect(payload.player1Name).toBe('Player 1');
      expect(payload.player1HasSelectedMove).toBe(true);
      expect(payload.player1Move).toBe(MinRpsMove.None); // Should not reveal move
      expect(payload.player2Id).toBe('player-2-id');
      expect(payload.player2Name).toBe('Player 2');
      expect(payload.player2HasSelectedMove).toBe(false);
      expect(payload.player2Move).toBe(MinRpsMove.None);
    });
  });

  describe('gameStateUpdatePayloadToDomain', () => {
    it('should map game state update payload to domain', () => {
      const payload = new MinRpsGameStateUpdatePayload();
      payload.gameId = 'test-game-id';
      payload.player1Id = 'player-1-id';
      payload.player1Name = 'Player 1';
      payload.player1Move = MinRpsMove.Rock;
      payload.player1HasSelectedMove = true;
      payload.player2Id = 'player-2-id';
      payload.player2Name = 'Player 2';
      payload.player2Move = MinRpsMove.Scissors;
      payload.player2HasSelectedMove = true;

      const domain: MinRpsGame = MinRpsDomainMapper.gameStateUpdatePayloadToDomain(payload);

      expect(domain.id).toBe('test-game-id');
      expect(domain.player1.id).toBe('player-1-id');
      expect(domain.player1.name).toBe('Player 1');
      expect(domain.player1.move).toBe(MinRpsMove.Rock);
      expect(domain.player2.id).toBe('player-2-id');
      expect(domain.player2.name).toBe('Player 2');
      expect(domain.player2.move).toBe(MinRpsMove.Scissors);
    });
  });
});
