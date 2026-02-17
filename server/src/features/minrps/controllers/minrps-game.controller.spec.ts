import { MinRpsGameController } from './minrps-game.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsGameService } from '../services/minrps-game.service';
import { MinRpsCreateGameDto } from '../models/dtos/minrps-create-game.dto';
import { MinRpsGameDto } from '../models/dtos/minrps-game.dto';

describe('MinRpsGameController', () => {
  let controller: MinRpsGameController;
  let service: jest.Mocked<MinRpsGameService>;

  beforeEach(async () => {
    const mockService = {
      createGame: jest.fn(),
      deleteGame: jest.fn(),
      getAllGames: jest.fn(),
      getGame: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinRpsGameController],
      providers: [
        {
          provide: MinRpsGameService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<MinRpsGameController>(MinRpsGameController);
    service = module.get(MinRpsGameService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a game', async () => {
      const createDto = new MinRpsCreateGameDto();
      createDto.name = 'Test Game';

      const gameDto = new MinRpsGameDto();
      gameDto.id = 'test-id';
      gameDto.name = 'Test Game';

      service.createGame.mockResolvedValue(gameDto);

      const result = await controller.create(createDto);

      expect(result).toBe(gameDto);
      expect(service.createGame).toHaveBeenCalledWith(createDto);
    });
  });

  describe('delete', () => {
    it('should delete a game', async () => {
      service.deleteGame.mockResolvedValue(undefined);

      await controller.delete('test-id');

      expect(service.deleteGame).toHaveBeenCalledWith('test-id');
    });
  });

  describe('getAll', () => {
    it('should return all games', async () => {
      const gameDtos = [
        Object.assign(new MinRpsGameDto(), { id: '1', name: 'Game 1' }),
        Object.assign(new MinRpsGameDto(), { id: '2', name: 'Game 2' }),
      ];

      service.getAllGames.mockResolvedValue(gameDtos);

      const result = await controller.getAll();

      expect(result).toBe(gameDtos);
      expect(service.getAllGames).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should return a game by id', async () => {
      const gameDto = new MinRpsGameDto();
      gameDto.id = 'test-id';
      gameDto.name = 'Test Game';

      service.getGame.mockResolvedValue(gameDto);

      const result = await controller.get('test-id');

      expect(result).toBe(gameDto);
      expect(service.getGame).toHaveBeenCalledWith('test-id');
    });
  });
});
