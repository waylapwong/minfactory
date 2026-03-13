import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsSingleplayerController } from './minrps-singleplayer.controller';
import { MinRpsSingleplayerService } from '../services/minrps-singleplayer.service';
import { MinRpsPlayDto } from '../models/dtos/minrps-play.dto';
import { MinRpsPlayResultDto } from '../models/dtos/minrps-play-result.dto';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsResult } from '../models/enums/minrps-game-result.enum';

describe('MinRpsSingleplayerController', () => {
  let controller: MinRpsSingleplayerController;
  let service: jest.Mocked<MinRpsSingleplayerService>;

  beforeEach(async () => {
    const mockService = {
      playGame: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinRpsSingleplayerController],
      providers: [
        {
          provide: MinRpsSingleplayerService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<MinRpsSingleplayerController>(MinRpsSingleplayerController);
    service = module.get(MinRpsSingleplayerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('play', () => {
    it('should play a game and return result', () => {
      const playDto = new MinRpsPlayDto();
      playDto.player1Move = MinRpsMove.Rock;

      const resultDto = new MinRpsPlayResultDto();
      resultDto.player1Move = MinRpsMove.Rock;
      resultDto.player2Move = MinRpsMove.Scissors;
      resultDto.result = MinRpsResult.Player1;

      service.playGame.mockReturnValue(resultDto);

      const result = controller.play(playDto);

      expect(result).toBe(resultDto);
      expect(service.playGame).toHaveBeenCalledWith(playDto);
    });
  });
});
