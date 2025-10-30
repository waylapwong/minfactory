import { Test, TestingModule } from '@nestjs/testing';

import { MinRpsGameService } from './minrps-game.service';

describe('MinRPSGameService', () => {
  let service: MinRpsGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRpsGameService],
    }).compile();

    service = module.get<MinRpsGameService>(MinRpsGameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
