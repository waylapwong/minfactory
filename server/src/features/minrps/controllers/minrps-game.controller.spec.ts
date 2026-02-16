import { MinRpsGameController } from './minrps-game.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsGameService } from '../services/minrps-game.service';

describe('MinRpsGameController', () => {
  let controller: MinRpsGameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinRpsGameController],
      providers: [
        {
          provide: MinRpsGameService,
          useValue: {
            createGame: jest.fn(),
            deleteGame: jest.fn(),
            getAllGames: jest.fn(),
            getGame: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MinRpsGameController>(MinRpsGameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
