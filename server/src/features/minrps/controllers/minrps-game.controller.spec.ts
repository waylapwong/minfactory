import { Test, TestingModule } from '@nestjs/testing';

import { MinRpsGameController } from './minrps-game.controller';

describe('MinRPSGameController', () => {
  let controller: MinRpsGameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinRpsGameController],
    }).compile();

    controller = module.get<MinRpsGameController>(MinRpsGameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
