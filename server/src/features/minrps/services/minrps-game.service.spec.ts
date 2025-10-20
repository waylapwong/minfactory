import { Test, TestingModule } from '@nestjs/testing';

import { MinRPSGameService } from './minrps-game.service';

describe('MinRPSGameService', () => {
  let service: MinRPSGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRPSGameService],
    }).compile();

    service = module.get<MinRPSGameService>(MinRPSGameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
