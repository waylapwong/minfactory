import { MinRpsController } from './minrps.controller';
import { Test, TestingModule } from '@nestjs/testing';

describe('MinRpsController', () => {
  let controller: MinRpsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinRpsController],
    }).compile();

    controller = module.get<MinRpsController>(MinRpsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
