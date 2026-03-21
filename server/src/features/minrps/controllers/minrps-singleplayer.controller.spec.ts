import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsSingleplayerController } from './minrps-singleplayer.controller';
import { MinRpsSingleplayerService } from '../services/minrps-singleplayer.service';
import { MINRPS_SINGLEPLAYER_SERVICE_MOCK } from '../mocks/minrps-singleplayer.service.mock';
import { MinRpsPlayDto } from '../models/dtos/minrps-play.dto';
import { MinRpsPlayResultDto } from '../models/dtos/minrps-play-result.dto';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsResult } from '../models/enums/minrps-game-result.enum';

describe('MinRpsSingleplayerController', () => {
  let controller: MinRpsSingleplayerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinRpsSingleplayerController],
      providers: [
        {
          provide: MinRpsSingleplayerService,
          useValue: MINRPS_SINGLEPLAYER_SERVICE_MOCK,
        },
      ],
    }).compile();

    controller = module.get<MinRpsSingleplayerController>(MinRpsSingleplayerController);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

      MINRPS_SINGLEPLAYER_SERVICE_MOCK.playGame.mockReturnValue(resultDto);

      const result = controller.play(playDto);

      expect(result).toBe(resultDto);
      expect(MINRPS_SINGLEPLAYER_SERVICE_MOCK.playGame).toHaveBeenCalledWith(playDto);
    });
  });
});
