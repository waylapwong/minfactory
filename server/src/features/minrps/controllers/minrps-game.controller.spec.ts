import { MinRpsGameController } from './minrps-game.controller';
import { Test, TestingModule } from '@nestjs/testing';

describe('MinRpsGameController', () => {
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
