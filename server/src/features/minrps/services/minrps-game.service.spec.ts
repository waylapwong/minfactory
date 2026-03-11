import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsPlayer } from '../models/domains/minrps-player';
import { MinRpsCreateGameDto } from '../models/dtos/minrps-create-game.dto';
import { MinRpsGameEntity } from '../models/entities/minrps-game.entity';
import { MinRpsGameRepository } from '../repositories/minrps-game.repository';
import { MinRpsMatchRepository } from '../repositories/minrps-match.repository';
import { MinRpsGameService } from './minrps-game.service';

describe('MinRpsGameService', () => {
  let service: MinRpsGameService;
  let repository: jest.Mocked<MinRpsGameRepository>;
  let matchRepository: jest.Mocked<MinRpsMatchRepository>;

  beforeEach(async () => {
    const mockRepository = {
      save: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
    };

    const mockMatchRepository = {
      findOne: jest.fn(),
      findOrCreate: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinRpsGameService,
        {
          provide: MinRpsGameRepository,
          useValue: mockRepository,
        },
        {
          provide: MinRpsMatchRepository,
          useValue: mockMatchRepository,
        },
      ],
    }).compile();

    service = module.get<MinRpsGameService>(MinRpsGameService);
    repository = module.get(MinRpsGameRepository);
    matchRepository = module.get(MinRpsMatchRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGame', () => {
    it('should create and return a game', async () => {
      const createDto = new MinRpsCreateGameDto();
      createDto.name = 'Test Game';

      const savedEntity = new MinRpsGameEntity();
      savedEntity.id = 'test-id';
      savedEntity.name = 'Test Game';
      savedEntity.createdAt = new Date();

      repository.save.mockResolvedValue(savedEntity);

      const result = await service.createGame(createDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Game');
      expect(result.id).toBe('test-id');
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test Game' }));
    });
  });

  describe('deleteGame', () => {
    it('should delete a game by id', async () => {
      repository.delete.mockResolvedValue(undefined);

      await service.deleteGame('test-id');

      expect(repository.delete).toHaveBeenCalledWith('test-id');
    });
  });

  describe('getAllGames', () => {
    it('should return all games', async () => {
      const entities = [
        Object.assign(new MinRpsGameEntity(), {
          id: '1',
          name: 'Game 1',
          createdAt: new Date(),
        }),
        Object.assign(new MinRpsGameEntity(), {
          id: '2',
          name: 'Game 2',
          createdAt: new Date(),
        }),
      ];

      repository.findAll.mockResolvedValue(entities);
      matchRepository.findOne.mockReturnValue(null);

      const result = await service.getAllGames();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Game 1');
      expect(result[1].name).toBe('Game 2');
      expect(repository.findAll).toHaveBeenCalled();
    });

    it('should map observer and player counts from match repository state', async () => {
      const entity = Object.assign(new MinRpsGameEntity(), {
        id: '1',
        name: 'Game 1',
        createdAt: new Date(),
      });

      const match = new MinRpsGame();
      match.id = '1';
      match.addObserver('observer-1');
      match.addObserver('observer-2');
      match.player1 = Object.assign(new MinRpsPlayer(), { id: 'player-1' });
      match.player2 = new MinRpsPlayer();

      repository.findAll.mockResolvedValue([entity]);
      matchRepository.findOne.mockReturnValue(match);

      const result = await service.getAllGames();

      expect(result).toHaveLength(1);
      expect(result[0].observerCount).toBe(2);
      expect(result[0].playerCount).toBe(1);
      expect(matchRepository.findOne).toHaveBeenCalledWith('1');
    });

    it('should return empty array when no games exist', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.getAllGames();

      expect(result).toEqual([]);
    });
  });

  describe('getGame', () => {
    it('should return a game by id', async () => {
      const entity = new MinRpsGameEntity();
      entity.id = 'test-id';
      entity.name = 'Test Game';
      entity.createdAt = new Date();

      repository.findOne.mockResolvedValue(entity);
      matchRepository.findOne.mockReturnValue(null);

      const result = await service.getGame('test-id');

      expect(result).toBeDefined();
      expect(result.id).toBe('test-id');
      expect(result.name).toBe('Test Game');
      expect(repository.findOne).toHaveBeenCalledWith('test-id');
    });

    it('should map observer and player counts from match repository in getGame', async () => {
      const entity = new MinRpsGameEntity();
      entity.id = 'test-id';
      entity.name = 'Test Game';
      entity.createdAt = new Date();

      const match = new MinRpsGame();
      match.id = 'test-id';
      match.addObserver('observer-1');
      match.player1 = Object.assign(new MinRpsPlayer(), { id: 'player-1' });
      match.player2 = Object.assign(new MinRpsPlayer(), { id: 'player-2' });

      repository.findOne.mockResolvedValue(entity);
      matchRepository.findOne.mockReturnValue(match);

      const result = await service.getGame('test-id');

      expect(result.observerCount).toBe(1);
      expect(result.playerCount).toBe(2);
      expect(matchRepository.findOne).toHaveBeenCalledWith('test-id');
    });
  });
});
