import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MinRPSApiService, MinRpsPlayDto, MinRpsPlayResultDto } from '../../../core/generated';

@Injectable({
  providedIn: 'root',
})
export class MinRpsPlayRepository {
  constructor(private readonly apiService: MinRPSApiService) {}

  public async play(dto: MinRpsPlayDto): Promise<MinRpsPlayResultDto> {
    return await firstValueFrom(this.apiService.playMinRpsGame(dto));
  }
}
