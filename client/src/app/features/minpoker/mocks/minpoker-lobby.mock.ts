import { MinPokerLobbyViewModel } from '../models/viewmodels/minpoker-lobby.viewmodel';

export const MINPOKER_LOBBY_MOCK_GAMES: MinPokerLobbyViewModel[] = [
  {
    id: 'high-rollers-evening',
    name: 'High Rollers Evening',
    playerCount: 4,
    maxPlayerCount: 6,
    observerCount: 2,
    smallBlind: 10,
    bigBlind: 20,
    buyIn: 2000,
    createdAt: new Date('2026-03-24T18:45:00'),
  },
  {
    id: 'weekend-friends-table',
    name: 'Weekend Friends Table',
    playerCount: 3,
    maxPlayerCount: 8,
    observerCount: 0,
    smallBlind: 25,
    bigBlind: 50,
    buyIn: 5000,
    createdAt: new Date('2026-03-24T19:10:00'),
  },
  {
    id: 'late-night-turbo',
    name: 'Late Night Turbo',
    playerCount: 5,
    maxPlayerCount: 6,
    observerCount: 1,
    smallBlind: 50,
    bigBlind: 100,
    buyIn: 10000,
    createdAt: new Date('2026-03-24T20:00:00'),
  },
];
