import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsMatchService } from './minrps-match.service';

describe('MinRpsMatchService', () => {
  let service: MinRpsMatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRpsMatchService],
    }).compile();

    service = module.get<MinRpsMatchService>(MinRpsMatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
