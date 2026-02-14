import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MinRPSApiService, MinRpsCreateGameDto, MinRpsGameDto } from '../../../core/generated';

@Injectable({
  providedIn: 'root',
})
export class MinRpsGameRepository {
  constructor(private readonly apiService: MinRPSApiService) {}

  public async create(name: string): Promise<MinRpsGameDto> {
    const dto: MinRpsCreateGameDto = { name };
    return await firstValueFrom(this.apiService.createMinRpsGame(dto));
  }

  public async delete(id: string): Promise<void> {
    return await firstValueFrom(this.apiService.deleteMinRpsGame(id));
  }

  public async get(id: string): Promise<MinRpsGameDto> {
    return await firstValueFrom(this.apiService.getMinRpsGame(id));
  }

  public async getAll(): Promise<MinRpsGameDto[]> {
    return await firstValueFrom(this.apiService.getAllMinRpsGames());
  }
}
