import { Injectable } from '@nestjs/common';
import { MinRpsGame } from '../models/domains/minrps-game';
import { MinRpsGameRepository } from '../repositories/minrps-game.repository';
import { MinRpsMatchRepository } from '../repositories/minrps-match.repository';

@Injectable()
export class MinRpsGameService {
  constructor(
    private readonly gameRepository: MinRpsGameRepository,
    private readonly matchRepository: MinRpsMatchRepository,
  ) {}

  public async createGame(domain: MinRpsGame): Promise<MinRpsGame> {
    return await this.gameRepository.save(domain);
  }

  public async deleteGame(id: string): Promise<void> {
    await this.gameRepository.delete(id);
  }

  public async getAllGames(): Promise<MinRpsGame[]> {
    return await this.gameRepository.findAll();
  }

  public async getGame(id: string): Promise<MinRpsGame> {
    return await this.gameRepository.find(id);
  }
}
