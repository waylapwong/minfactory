import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MinPokerApiService, MinPokerCreateGameDto, MinPokerGameDto } from '../../../core/generated';

@Injectable({
  providedIn: 'root',
})
export class MinPokerGameRepository {
  constructor(private readonly apiService: MinPokerApiService) {}

  public async create(game: { name: string }): Promise<MinPokerGameDto> {
    const dto: MinPokerCreateGameDto = { name: game.name };
    return await firstValueFrom(this.apiService.createMinPokerGame(dto));
  }

  public async delete(id: string): Promise<void> {
    return await firstValueFrom(this.apiService.deleteMinPokerGame(id));
  }

  public async getAll(): Promise<MinPokerGameDto[]> {
    return await firstValueFrom(this.apiService.getAllMinPokerGames());
  }
}
