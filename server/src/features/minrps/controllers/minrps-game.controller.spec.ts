import { MinRpsGameController } from './minrps-game.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsGameService } from '../services/minrps-game.service';
import { MINRPS_GAME_SERVICE_MOCK } from '../services/minrps-game.service.mock';
import { MinRpsCreateGameDto } from '../models/dtos/minrps-create-game.dto';
import { MinRpsGameDto } from '../models/dtos/minrps-game.dto';

describe('MinRpsGameController', () => {
  let controller: MinRpsGameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinRpsGameController],
      providers: [
        {
          provide: MinRpsGameService,
          useValue: MINRPS_GAME_SERVICE_MOCK,
        },
      ],
    }).compile();

    controller = module.get<MinRpsGameController>(MinRpsGameController);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

      MINRPS_GAME_SERVICE_MOCK.createGame.mockResolvedValue(gameDto);

      const result = await controller.create(createDto);

      expect(result).toBe(gameDto);
      expect(MINRPS_GAME_SERVICE_MOCK.createGame).toHaveBeenCalledWith(createDto);
    });
  });

  describe('delete', () => {
    it('should delete a game', async () => {
      MINRPS_GAME_SERVICE_MOCK.deleteGame.mockResolvedValue(undefined);

      await controller.delete('test-id');

      expect(MINRPS_GAME_SERVICE_MOCK.deleteGame).toHaveBeenCalledWith('test-id');
    });
  });

  describe('getAll', () => {
    it('should return all games', async () => {
      const gameDtos = [
        Object.assign(new MinRpsGameDto(), { id: '1', name: 'Game 1' }),
        Object.assign(new MinRpsGameDto(), { id: '2', name: 'Game 2' }),
      ];

      MINRPS_GAME_SERVICE_MOCK.getAllGames.mockResolvedValue(gameDtos);

      const result = await controller.getAll();

      expect(result).toBe(gameDtos);
      expect(MINRPS_GAME_SERVICE_MOCK.getAllGames).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should return a game by id', async () => {
      const gameDto = new MinRpsGameDto();
      gameDto.id = 'test-id';
      gameDto.name = 'Test Game';

      MINRPS_GAME_SERVICE_MOCK.getGame.mockResolvedValue(gameDto);

      const result = await controller.get('test-id');

      expect(result).toBe(gameDto);
      expect(MINRPS_GAME_SERVICE_MOCK.getGame).toHaveBeenCalledWith('test-id');
    });
  });
});
