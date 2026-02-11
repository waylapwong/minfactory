import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsSinglePlayerController } from './minrps-single-player.controller';

describe('MinRpsSinglePlayerController', () => {
  let controller: MinRpsSinglePlayerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinRpsSinglePlayerController],
    }).compile();

    controller = module.get<MinRpsSinglePlayerController>(MinRpsSinglePlayerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
