import { Test, TestingModule } from '@nestjs/testing';

import { MinRPSGameController } from './minrps-game.controller';

describe('MinRPSGameController', () => {
  let controller: MinRPSGameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinRPSGameController],
    }).compile();

    controller = module.get<MinRPSGameController>(MinRPSGameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
