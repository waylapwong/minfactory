import { Test, TestingModule } from '@nestjs/testing';
import { MinPokerController } from './minpoker.controller';

describe('MinPokerController', () => {
  let controller: MinPokerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinPokerController],
    }).compile();

    controller = module.get<MinPokerController>(MinPokerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
