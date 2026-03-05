import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsPlayerIdRepository } from './minrps-player-id.repository';

describe('MinRpsPlayerIdRepository', () => {
  let service: MinRpsPlayerIdRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRpsPlayerIdRepository],
    }).compile();

    service = module.get<MinRpsPlayerIdRepository>(MinRpsPlayerIdRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
