import { MinPokerGameVisibility } from '../../../../core/generated';

export class MinPokerPublicGameVm {
  public bigBlind!: number;
  public createdAt!: Date;
  public id!: string;
  public maxPlayerCount!: number;
  public name!: string;
  public observerCount!: number;
  public playerCount!: number;
  public smallBlind!: number;
  public visibility!: MinPokerGameVisibility;
}
