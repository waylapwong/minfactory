import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MinPokerApiService, MinPokerGameDto } from '../../../core/generated';
import { MINPOKER_API_SERVICE_MOCK } from '../mocks/minpoker-api.service.mock';
import { MinPokerGameRepository } from './minpoker-game.repository';

describe('MinPokerGameRepository', () => {
  let repository: MinPokerGameRepository;

  beforeEach(() => {
    MINPOKER_API_SERVICE_MOCK.getAllMinPokerGamesForUser.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinPokerGameRepository,
        { provide: MinPokerApiService, useValue: MINPOKER_API_SERVICE_MOCK },
      ],
    });

    repository = TestBed.inject(MinPokerGameRepository);
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  describe('getAll()', () => {
    it('should get all games via API service', async () => {
      const mockDtos: MinPokerGameDto[] = [
        {
          bigBlind: 20,
          createdAt: new Date('2026-01-01T18:00:00.000Z').toISOString(),
          id: 'id-1',
          maxPlayerCount: 6,
          name: 'Game 1',
          observerCount: 0,
          playerCount: 2,
          smallBlind: 10,
        },
        {
          bigBlind: 50,
          createdAt: new Date('2026-01-02T18:00:00.000Z').toISOString(),
          id: 'id-2',
          maxPlayerCount: 9,
          name: 'Game 2',
          observerCount: 1,
          playerCount: 4,
          smallBlind: 25,
        },
      ];

      MINPOKER_API_SERVICE_MOCK.getAllMinPokerGamesForUser.and.returnValue(of(mockDtos) as any);

      const result = await repository.getAll();

      expect(result).toEqual(mockDtos);
      expect(MINPOKER_API_SERVICE_MOCK.getAllMinPokerGamesForUser).toHaveBeenCalled();
    });
  });
});
