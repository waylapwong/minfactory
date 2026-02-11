import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsSinglePlayerService } from './minrps-single-player.service';

describe('MinRpsSinglePlayerService', () => {
  let service: MinRpsSinglePlayerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRpsSinglePlayerService],
    }).compile();

    service = module.get<MinRpsSinglePlayerService>(MinRpsSinglePlayerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
