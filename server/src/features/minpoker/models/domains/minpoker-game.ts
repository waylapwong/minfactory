import { MinPokerPlayer } from './minpoker-player';
import { GameRuleException } from 'src/shared/exceptions/game-rule.exception';

export class MinPokerGame {
  public bigBlind: number = 2;
  public createdAt: Date = new Date(0);
  public creatorId: string = '';
  public id: string = '';
  public name: string = '';
  public observers: Map<string, MinPokerPlayer> = new Map<string, MinPokerPlayer>();
  public players: Array<MinPokerPlayer | null> = Array.from({ length: 6 }, () => null);
  public smallBlind: number = 1;
  public tableSize: number = 6;

  constructor(init?: Partial<MinPokerGame>) {
    if (init) {
      Object.assign(this, init);
    }
  }

  public addObserver(observerId: string): void {
    if (this.isPlayer(observerId) || this.isObserver(observerId)) {
      return;
    }

    this.observers.set(observerId, new MinPokerPlayer({ id: observerId }));
  }

  public getPlayerCount(): number {
    return this.players.filter((player: MinPokerPlayer | null) => player !== null).length;
  }

  public hasParticipants(): boolean {
    return this.getPlayerCount() > 0 || this.observers.size > 0;
  }

  public isObserver(observerId: string): boolean {
    return this.observers.has(observerId);
  }

  public isPlayer(playerId: string): boolean {
    return this.players.some((player: MinPokerPlayer | null) => player?.id === playerId);
  }

  public removeObserver(observerId: string): void {
    this.observers.delete(observerId);
  }

  public removePlayer(playerId: string): void {
    const seat: number = this.players.findIndex((player: MinPokerPlayer | null) => player?.id === playerId);
    if (seat !== -1) {
      this.players[seat] = null;
      return;
    }

    this.removeObserver(playerId);
  }

  public seatPlayer(player: MinPokerPlayer, seat: number): void {
    this.assertSeatExists(seat);

    const seatedPlayer: MinPokerPlayer | null = this.players[seat];
    if (seatedPlayer && seatedPlayer.id !== player.id) {
      throw new GameRuleException(`Seat ${seat} is already occupied`);
    }

    const currentSeat: number = this.players.findIndex(
      (existingPlayer: MinPokerPlayer | null) => existingPlayer?.id === player.id,
    );
    if (currentSeat !== -1 && currentSeat !== seat) {
      this.players[currentSeat] = null;
    }

    player.seat = seat;
    this.players[seat] = player;
    this.removeObserver(player.id);
  }

  private assertSeatExists(seat: number): void {
    if (!Number.isInteger(seat) || seat < 0 || seat >= this.tableSize) {
      throw new GameRuleException(`Seat ${seat} is invalid`);
    }
  }
}
