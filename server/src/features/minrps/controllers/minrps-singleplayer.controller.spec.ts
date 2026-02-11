import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsSingleplayerController } from './minrps-singleplayer.controller';

describe('MinRpsSingleplayerController', () => {
  let controller: MinRpsSingleplayerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinRpsSingleplayerController],
    }).compile();

    controller = module.get<MinRpsSingleplayerController>(MinRpsSingleplayerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
