import { MinPokerGameVisibility } from '../../../../core/generated';

export class MinPokerPublicGameVm {
  declare public bigBlind: number;
  declare public createdAt: Date;
  declare public id: string;
  declare public maxPlayerCount: number;
  declare public name: string;
  declare public observerCount: number;
  declare public playerCount: number;
  declare public smallBlind: number;
  declare public visibility: MinPokerGameVisibility;
}
