import { MinRPSPlayer } from './minprs-player';

export class MinRPSGame {
  public static readonly MAX_PLAYERS: number = 2;
  public static readonly MIN_PLAYERS: number = 2;
  public static readonly PLAYER_1_ID: string = '1';
  public static readonly PLAYER_2_ID: string = '2';

  public loser: MinRPSPlayer | null = null;
  public players: Map<string, MinRPSPlayer> = new Map<string, MinRPSPlayer>();
  public test = 1;
  public winner: MinRPSPlayer | null = null;

  public getPlayer1(): MinRPSPlayer {
    const player: MinRPSPlayer | undefined = this.players.get(MinRPSGame.PLAYER_1_ID);
    if (!player) {
      throw new Error('Player 1 not found');
    }
    return player;
  }

  public getPlayer2(): MinRPSPlayer | undefined {
    return this.players.get(MinRPSGame.PLAYER_2_ID);
  }

  public setPlayer1(player: MinRPSPlayer): void {
    this.players.set(MinRPSGame.PLAYER_1_ID, player);
  }

  public setPlayer2(player: MinRPSPlayer): void {
    this.players.set(MinRPSGame.PLAYER_2_ID, player);
  }

  public validate(): void {
    if (this.players.size < MinRPSGame.MIN_PLAYERS) {
      throw new Error('Not enough players');
    }
    if (this.players.size > MinRPSGame.MAX_PLAYERS) {
      throw new Error('Too many players');
    }
  }
}
