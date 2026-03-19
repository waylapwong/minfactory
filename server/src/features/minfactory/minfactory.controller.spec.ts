import { Test, TestingModule } from '@nestjs/testing';
import { MinFactoryController } from './minfactory.controller';

describe('MinFactoryController', () => {
  let controller: MinFactoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinFactoryController],
    }).compile();

    controller = module.get<MinFactoryController>(MinFactoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
