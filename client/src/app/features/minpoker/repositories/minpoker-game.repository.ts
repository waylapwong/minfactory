import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MinPokerApiService, MinPokerGameDto } from '../../../core/generated';

@Injectable({
  providedIn: 'root',
})
export class MinPokerGameRepository {
  constructor(private readonly apiService: MinPokerApiService) {}

  public async getAll(): Promise<MinPokerGameDto[]> {
    return await firstValueFrom(this.apiService.getAllMinPokerGamesForUser());
  }
}
