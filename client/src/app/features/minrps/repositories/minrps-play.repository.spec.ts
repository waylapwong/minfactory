import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MinRPSApiService, MinRpsMove, MinRpsPlayDto, MinRpsPlayResultDto, MinRpsResult } from '../../../core/generated';
import { MinRpsPlayRepository } from './minrps-play.repository';

describe('MinRpsPlayRepository', () => {
  let repository: MinRpsPlayRepository;
  let mockApiService: jasmine.SpyObj<MinRPSApiService>;

  beforeEach(() => {
    mockApiService = jasmine.createSpyObj('MinRPSApiService', ['playMinRpsGame']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinRpsPlayRepository,
        { provide: MinRPSApiService, useValue: mockApiService },
      ],
    });
    repository = TestBed.inject(MinRpsPlayRepository);
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  describe('play()', () => {
    it('should play a game via API service', async () => {
      const playDto: MinRpsPlayDto = {
        player1Move: MinRpsMove.Rock,
      };
      const resultDto: MinRpsPlayResultDto = {
        player1Move: MinRpsMove.Rock,
        player2Move: MinRpsMove.Scissors,
        result: MinRpsResult.Player1,
      };
      mockApiService.playMinRpsGame.and.returnValue(of(resultDto) as any);

      const result = await repository.play(playDto);

      expect(result).toEqual(resultDto);
      expect(mockApiService.playMinRpsGame).toHaveBeenCalledWith(playDto);
    });

    it('should handle different game outcomes', async () => {
      const playDto: MinRpsPlayDto = {
        player1Move: MinRpsMove.Paper,
      };
      const resultDto: MinRpsPlayResultDto = {
        player1Move: MinRpsMove.Paper,
        player2Move: MinRpsMove.Rock,
        result: MinRpsResult.Player1,
      };
      mockApiService.playMinRpsGame.and.returnValue(of(resultDto) as any);

      const result = await repository.play(playDto);

      expect(result.result).toBe(MinRpsResult.Player1);
    });
  });
});
