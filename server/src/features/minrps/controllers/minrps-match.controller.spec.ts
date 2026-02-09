import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsMatchController } from './minrps-match.controller';

describe('MinRpsMatchController', () => {
  let controller: MinRpsMatchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinRpsMatchController],
    }).compile();

    controller = module.get<MinRpsMatchController>(MinRpsMatchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
