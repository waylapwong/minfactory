import { Test, TestingModule } from '@nestjs/testing';

import { MinRPSController } from './minrps.controller';

describe('MinRPSController', () => {
  let controller: MinRPSController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinRPSController],
    }).compile();

    controller = module.get<MinRPSController>(MinRPSController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
