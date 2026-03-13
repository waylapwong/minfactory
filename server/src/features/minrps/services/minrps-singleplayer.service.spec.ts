import { Test, TestingModule } from '@nestjs/testing';
import { MinRpsSingleplayerService } from './minrps-singleplayer.service';
import { MinRpsPlayDto } from '../models/dtos/minrps-play.dto';
import { MinRpsMove } from '../models/enums/minrps-move.enum';
import { MinRpsResult } from '../models/enums/minrps-game-result.enum';

describe('MinRpsSingleplayerService', () => {
  let service: MinRpsSingleplayerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinRpsSingleplayerService],
    }).compile();

    service = module.get<MinRpsSingleplayerService>(MinRpsSingleplayerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('playGame', () => {
    it('should play game and return result with player1 Rock', () => {
      const playDto = new MinRpsPlayDto();
      playDto.player1Move = MinRpsMove.Rock;

      const result = service.playGame(playDto);

      expect(result).toBeDefined();
      expect(result.player1Move).toBe(MinRpsMove.Rock);
      expect(result.player2Move).toBeDefined();
      expect(result.player2Move).not.toBe(MinRpsMove.None);
      expect([MinRpsMove.Rock, MinRpsMove.Paper, MinRpsMove.Scissors]).toContain(result.player2Move);
      expect(result.result).toBeDefined();
      expect([MinRpsResult.Player1, MinRpsResult.Player2, MinRpsResult.Draw]).toContain(result.result);
    });

    it('should play game and return result with player1 Paper', () => {
      const playDto = new MinRpsPlayDto();
      playDto.player1Move = MinRpsMove.Paper;

      const result = service.playGame(playDto);

      expect(result).toBeDefined();
      expect(result.player1Move).toBe(MinRpsMove.Paper);
      expect(result.player2Move).toBeDefined();
      expect(result.player2Move).not.toBe(MinRpsMove.None);
    });

    it('should play game and return result with player1 Scissors', () => {
      const playDto = new MinRpsPlayDto();
      playDto.player1Move = MinRpsMove.Scissors;

      const result = service.playGame(playDto);

      expect(result).toBeDefined();
      expect(result.player1Move).toBe(MinRpsMove.Scissors);
      expect(result.player2Move).toBeDefined();
      expect(result.player2Move).not.toBe(MinRpsMove.None);
    });

    it('should generate random NPC moves across multiple plays', () => {
      const playDto = new MinRpsPlayDto();
      playDto.player1Move = MinRpsMove.Rock;

      const moves = new Set<MinRpsMove>();

      // Play 50 times to get different random moves
      for (let i = 0; i < 50; i++) {
        const result = service.playGame(playDto);
        moves.add(result.player2Move);
      }

      // With 50 plays, we should see at least 2 different moves (very high probability)
      expect(moves.size).toBeGreaterThan(1);
    });

    it('should correctly determine winner when player1 uses Rock', () => {
      const playDto = new MinRpsPlayDto();
      playDto.player1Move = MinRpsMove.Rock;

      // Mock random to control NPC move
      jest.spyOn(Math, 'random').mockReturnValue(0.1); // Rock
      let result = service.playGame(playDto);
      expect(result.result).toBe(MinRpsResult.Draw);

      jest.spyOn(Math, 'random').mockReturnValue(0.4); // Paper
      result = service.playGame(playDto);
      expect(result.result).toBe(MinRpsResult.Player2);

      jest.spyOn(Math, 'random').mockReturnValue(0.8); // Scissors
      result = service.playGame(playDto);
      expect(result.result).toBe(MinRpsResult.Player1);

      jest.restoreAllMocks();
    });
  });
});
