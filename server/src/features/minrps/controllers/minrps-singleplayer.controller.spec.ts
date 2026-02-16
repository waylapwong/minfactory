import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsSingleplayerController } from './minrps-singleplayer.controller';
import { MinRpsSingleplayerService } from '../services/minrps-singleplayer.service';

describe('MinRpsSingleplayerController', () => {
  let controller: MinRpsSingleplayerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinRpsSingleplayerController],
      providers: [
        {
          provide: MinRpsSingleplayerService,
          useValue: {
            playGame: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MinRpsSingleplayerController>(MinRpsSingleplayerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
