import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsGameService } from './minrps-game.service';
import { MinRpsGameRepository } from '../repositories/minrps-game.repository';

describe('MinRpsGameService', () => {
  let service: MinRpsGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinRpsGameService,
        {
          provide: MinRpsGameRepository,
          useValue: {
            save: jest.fn(),
            delete: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MinRpsGameService>(MinRpsGameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
