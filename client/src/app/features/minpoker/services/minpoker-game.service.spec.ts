import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MinPokerGameDto } from '../../../core/generated';
import { MINPOKER_GAME_REPOSITORY_MOCK } from '../mocks/minpoker-game.repository.mock';
import { MinPokerGameRepository } from '../repositories/minpoker-game.repository';
import { MinPokerGameService } from './minpoker-game.service';

describe('MinPokerGameService', () => {
  let service: MinPokerGameService;

  beforeEach(() => {
    MINPOKER_GAME_REPOSITORY_MOCK.getAll.calls.reset();
    MINPOKER_GAME_REPOSITORY_MOCK.create.calls.reset();
    MINPOKER_GAME_REPOSITORY_MOCK.delete.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        MinPokerGameService,
        { provide: MinPokerGameRepository, useValue: MINPOKER_GAME_REPOSITORY_MOCK },
      ],
    });

    service = TestBed.inject(MinPokerGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadGames()', () => {
    it('should refresh and map games from repository', async () => {
      const mockDtos: MinPokerGameDto[] = [
        {
          bigBlind: 20,
          createdAt: new Date('2026-01-01T18:00:00.000Z').toISOString(),
          id: 'id-1',
          isPublic: false,
          tableSize: 6,
          name: 'Game 1',
          observerCount: 0,
          playerCount: 2,
          smallBlind: 10,
        },
        {
          bigBlind: 50,
          createdAt: new Date('2026-01-02T18:00:00.000Z').toISOString(),
          id: 'id-2',
          isPublic: true,
          tableSize: 6,
          name: 'Game 2',
          observerCount: 1,
          playerCount: 4,
          smallBlind: 25,
        },
      ];

      MINPOKER_GAME_REPOSITORY_MOCK.getAll.and.returnValue(Promise.resolve(mockDtos));

      await service.loadGames();

      expect(MINPOKER_GAME_REPOSITORY_MOCK.getAll).toHaveBeenCalled();
      expect(service.publicGamesVm().games.length).toBe(2);
      expect(service.publicGamesVm().games[0].id).toBe('id-2');
      expect(service.publicGamesVm().games[1].id).toBe('id-1');
      expect(service.publicGamesVm().games[0].smallBlind).toBe(25);
      expect(service.publicGamesVm().games[0].bigBlind).toBe(50);
    });
  });

  describe('createGame()', () => {
    it('should create a game and update cached games', async () => {
      const mockDto: MinPokerGameDto = {
        bigBlind: 50,
        createdAt: new Date().toISOString(),
        id: 'new-id',
        isPublic: false,
        tableSize: 6,
        name: 'New Game',
        observerCount: 0,
        playerCount: 1,
        smallBlind: 25,
      };

      MINPOKER_GAME_REPOSITORY_MOCK.create.and.returnValue(Promise.resolve(mockDto));

      await service.createGame('New Game');

      expect(MINPOKER_GAME_REPOSITORY_MOCK.create).toHaveBeenCalledWith({ name: 'New Game', isPublic: false });
      expect(service.publicGamesVm().games.length).toBe(1);
      expect(service.publicGamesVm().games[0].id).toBe('new-id');
    });

    it('should sort created game against already cached games', async () => {
      MINPOKER_GAME_REPOSITORY_MOCK.getAll.and.returnValue(
        Promise.resolve([
          {
            bigBlind: 20,
            createdAt: new Date('2026-01-01T18:00:00.000Z').toISOString(),
            id: 'older-id',
            isPublic: false,
            tableSize: 6,
            name: 'Older Game',
            observerCount: 0,
            playerCount: 2,
            smallBlind: 10,
          },
        ]),
      );
      MINPOKER_GAME_REPOSITORY_MOCK.create.and.returnValue(
        Promise.resolve({
          bigBlind: 50,
          createdAt: new Date('2026-01-02T18:00:00.000Z').toISOString(),
          id: 'newer-id',
          isPublic: false,
          tableSize: 6,
          name: 'Newer Game',
          observerCount: 0,
          playerCount: 1,
          smallBlind: 25,
        }),
      );

      await service.loadGames();
      await service.createGame('Newer Game');

      expect(service.publicGamesVm().games.map((game) => game.id)).toEqual(['newer-id', 'older-id']);
    });
  });

  describe('deleteGame()', () => {
    it('should delete a game and remove it from cached games', async () => {
      const mockDtos: MinPokerGameDto[] = [
        {
          bigBlind: 20,
          createdAt: new Date('2026-01-01T18:00:00.000Z').toISOString(),
          id: 'id-1',
          isPublic: false,
          tableSize: 6,
          name: 'Game 1',
          observerCount: 0,
          playerCount: 2,
          smallBlind: 10,
        },
        {
          bigBlind: 50,
          createdAt: new Date('2026-01-02T18:00:00.000Z').toISOString(),
          id: 'id-2',
          isPublic: true,
          tableSize: 6,
          name: 'Game 2',
          observerCount: 1,
          playerCount: 4,
          smallBlind: 25,
        },
      ];

      MINPOKER_GAME_REPOSITORY_MOCK.getAll.and.returnValue(Promise.resolve(mockDtos));
      MINPOKER_GAME_REPOSITORY_MOCK.delete.and.returnValue(Promise.resolve());

      await service.loadGames();
      await service.deleteGame('id-1');

      expect(MINPOKER_GAME_REPOSITORY_MOCK.delete).toHaveBeenCalledWith('id-1');
      expect(service.publicGamesVm().games.length).toBe(1);
      expect(service.publicGamesVm().games[0].id).toBe('id-2');
    });
  });
});
